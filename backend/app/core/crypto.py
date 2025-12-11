"""
Core Cryptographic Operations Module

This module provides production-ready cryptographic operations including:
- AES-256-GCM symmetric encryption (authenticated encryption)
- RSA-2048 asymmetric encryption
- SHA-256 and SHA-512 hashing
- Digital signatures with RSA-PSS
- Secure key generation and management

All functions use best practices from the Python cryptography library.
"""

import os
import base64
from typing import Tuple, Dict, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.rsa import (
    RSAPrivateKey,
    RSAPublicKey,
)
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature, InvalidTag


# ============================================================
# AES-256-GCM Symmetric Encryption
# ============================================================

def generate_aes_key(key_size: int = 256) -> bytes:
    """
    Generate a random AES key.
    
    Args:
        key_size: Key size in bits (128, 192, or 256)
        
    Returns:
        bytes: Random AES key
        
    Raises:
        ValueError: If key_size is invalid
    """
    if key_size not in [128, 192, 256]:
        raise ValueError("AES key size must be 128, 192, or 256 bits")
    
    key_bytes = key_size // 8
    return os.urandom(key_bytes)


def aes_encrypt(
    plaintext: str,
    key: Optional[bytes] = None
) -> Dict[str, str]:
    """
    Encrypt plaintext using AES-256-GCM (authenticated encryption).
    
    AES-GCM provides both confidentiality and authenticity. The tag
    ensures that the ciphertext hasn't been tampered with.
    
    Args:
        plaintext: String to encrypt
        key: AES key (generates new key if None)
        
    Returns:
        dict: Contains:
            - ciphertext: Base64 encoded encrypted data
            - key: Base64 encoded key (only if new key was generated)
            - nonce: Base64 encoded nonce/IV
            - tag: Base64 encoded authentication tag
            - algorithm: "AES-256-GCM"
            
    Example:
        result = aes_encrypt("Secret message")
        # Save result['key'], result['nonce'], result['tag']
        # for later decryption
    """
    # Generate new key if not provided
    if key is None:
        key = generate_aes_key(256)
        include_key = True
    else:
        include_key = False
    
    # Generate random 96-bit nonce (12 bytes is recommended for GCM)
    nonce = os.urandom(12)
    
    # Create AESGCM cipher
    aesgcm = AESGCM(key)
    
    # Encrypt (GCM mode returns ciphertext + tag combined)
    plaintext_bytes = plaintext.encode('utf-8')
    ciphertext_and_tag = aesgcm.encrypt(nonce, plaintext_bytes, None)
    
    # In AESGCM, the tag is appended to the ciphertext
    # Separate them for clarity (tag is last 16 bytes)
    ciphertext = ciphertext_and_tag[:-16]
    tag = ciphertext_and_tag[-16:]
    
    # Build result dictionary
    result = {
        "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
        "nonce": base64.b64encode(nonce).decode('utf-8'),
        "tag": base64.b64encode(tag).decode('utf-8'),
        "algorithm": "AES-256-GCM",
    }
    
    # Include key only if we generated it
    if include_key:
        result["key"] = base64.b64encode(key).decode('utf-8')
    
    return result


def aes_decrypt(
    ciphertext: str,
    key: bytes,
    nonce: str,
    tag: str
) -> str:
    """
    Decrypt AES-256-GCM encrypted data.
    
    Args:
        ciphertext: Base64 encoded ciphertext
        key: AES key (raw bytes)
        nonce: Base64 encoded nonce
        tag: Base64 encoded authentication tag
        
    Returns:
        str: Decrypted plaintext
        
    Raises:
        InvalidTag: If authentication fails (data tampered with)
        ValueError: If decoding fails
    """
    # Decode from base64
    ciphertext_bytes = base64.b64decode(ciphertext)
    nonce_bytes = base64.b64decode(nonce)
    tag_bytes = base64.b64decode(tag)
    
    # Reconstruct ciphertext + tag (AESGCM expects them together)
    ciphertext_and_tag = ciphertext_bytes + tag_bytes
    
    # Create AESGCM cipher
    aesgcm = AESGCM(key)
    
    # Decrypt and verify tag
    try:
        plaintext_bytes = aesgcm.decrypt(nonce_bytes, ciphertext_and_tag, None)
        return plaintext_bytes.decode('utf-8')
    except InvalidTag:
        raise ValueError("Authentication failed: data may have been tampered with")


# ============================================================
# RSA Asymmetric Encryption
# ============================================================

def generate_rsa_keypair(key_size: int = 2048) -> Tuple[RSAPrivateKey, RSAPublicKey]:
    """
    Generate an RSA key pair.
    
    Args:
        key_size: Key size in bits (2048, 3072, or 4096 recommended)
        
    Returns:
        tuple: (private_key, public_key)
        
    Raises:
        ValueError: If key_size is too small
    """
    if key_size < 2048:
        raise ValueError("RSA key size must be at least 2048 bits for security")
    
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    
    return private_key, public_key


def rsa_encrypt(plaintext: str, public_key: RSAPublicKey) -> str:
    """
    Encrypt plaintext using RSA with OAEP padding.
    
    Note: RSA can only encrypt small amounts of data (less than key size).
    For larger data, use hybrid encryption (RSA + AES).
    
    Args:
        plaintext: String to encrypt (max ~190 bytes for 2048-bit key)
        public_key: RSA public key
        
    Returns:
        str: Base64 encoded ciphertext
        
    Raises:
        ValueError: If plaintext is too large
    """
    plaintext_bytes = plaintext.encode('utf-8')
    
    # Encrypt with OAEP padding (recommended)
    ciphertext = public_key.encrypt(
        plaintext_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return base64.b64encode(ciphertext).decode('utf-8')


def rsa_decrypt(ciphertext: str, private_key: RSAPrivateKey) -> str:
    """
    Decrypt RSA encrypted data.
    
    Args:
        ciphertext: Base64 encoded ciphertext
        private_key: RSA private key
        
    Returns:
        str: Decrypted plaintext
        
    Raises:
        ValueError: If decryption fails
    """
    ciphertext_bytes = base64.b64decode(ciphertext)
    
    # Decrypt with OAEP padding
    plaintext_bytes = private_key.decrypt(
        ciphertext_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return plaintext_bytes.decode('utf-8')


# ============================================================
# Cryptographic Hashing
# ============================================================

def sha256_hash(data: str) -> str:
    """
    Compute SHA-256 hash of data.
    
    Args:
        data: String to hash
        
    Returns:
        str: Hexadecimal hash digest
    """
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.hashes import Hash
    
    digest = Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data.encode('utf-8'))
    return digest.finalize().hex()


def sha512_hash(data: str) -> str:
    """
    Compute SHA-512 hash of data.
    
    Args:
        data: String to hash
        
    Returns:
        str: Hexadecimal hash digest
    """
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.hashes import Hash
    
    digest = Hash(hashes.SHA512(), backend=default_backend())
    digest.update(data.encode('utf-8'))
    return digest.finalize().hex()


def verify_hash(data: str, hash_value: str, algorithm: str = "SHA-256") -> bool:
    """
    Verify that data matches a hash value.
    
    Args:
        data: Original data
        hash_value: Expected hash (hexadecimal)
        algorithm: Hash algorithm ("SHA-256" or "SHA-512")
        
    Returns:
        bool: True if hash matches
        
    Raises:
        ValueError: If algorithm is unsupported
    """
    if algorithm.upper() == "SHA-256":
        computed_hash = sha256_hash(data)
    elif algorithm.upper() == "SHA-512":
        computed_hash = sha512_hash(data)
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
    # Constant-time comparison to prevent timing attacks
    return computed_hash == hash_value


# ============================================================
# Digital Signatures
# ============================================================

def sign_data(data: str, private_key: RSAPrivateKey) -> str:
    """
    Create a digital signature for data using RSA-PSS.
    
    RSA-PSS is the recommended signature scheme (more secure than PKCS#1 v1.5).
    
    Args:
        data: String to sign
        private_key: RSA private key
        
    Returns:
        str: Base64 encoded signature
    """
    data_bytes = data.encode('utf-8')
    
    signature = private_key.sign(
        data_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA512()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA512()
    )
    
    return base64.b64encode(signature).decode('utf-8')


def verify_signature(data: str, signature: str, public_key: RSAPublicKey) -> bool:
    """
    Verify a digital signature.
    
    Args:
        data: Original data that was signed
        signature: Base64 encoded signature
        public_key: RSA public key
        
    Returns:
        bool: True if signature is valid
    """
    data_bytes = data.encode('utf-8')
    signature_bytes = base64.b64decode(signature)
    
    try:
        public_key.verify(
            signature_bytes,
            data_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA512()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA512()
        )
        return True
    except InvalidSignature:
        return False


# ============================================================
# Key Management
# ============================================================

def serialize_private_key(private_key: RSAPrivateKey, password: Optional[bytes] = None) -> str:
    """
    Serialize private key to PEM format.
    
    Args:
        private_key: RSA private key
        password: Optional password for encryption (recommended!)
        
    Returns:
        str: PEM encoded private key
    """
    if password:
        encryption = serialization.BestAvailableEncryption(password)
    else:
        encryption = serialization.NoEncryption()
    
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption
    )
    
    return pem.decode('utf-8')


def serialize_public_key(public_key: RSAPublicKey) -> str:
    """
    Serialize public key to PEM format.
    
    Args:
        public_key: RSA public key
        
    Returns:
        str: PEM encoded public key
    """
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return pem.decode('utf-8')


def load_private_key(pem_data: str, password: Optional[bytes] = None) -> RSAPrivateKey:
    """
    Load private key from PEM format.
    
    Args:
        pem_data: PEM encoded private key
        password: Password if key is encrypted
        
    Returns:
        RSAPrivateKey: Loaded private key
    """
    return serialization.load_pem_private_key(
        pem_data.encode('utf-8'),
        password=password,
        backend=default_backend()
    )


def load_public_key(pem_data: str) -> RSAPublicKey:
    """
    Load public key from PEM format.
    
    Args:
        pem_data: PEM encoded public key
        
    Returns:
        RSAPublicKey: Loaded public key
    """
    return serialization.load_pem_public_key(
        pem_data.encode('utf-8'),
        backend=default_backend()
    )


# ============================================================
# Hybrid Encryption (AES + RSA for large data)
# ============================================================

def hybrid_encrypt(plaintext: str, public_key: RSAPublicKey) -> Dict[str, str]:
    """
    Hybrid encryption: Encrypt data with AES, then encrypt AES key with RSA.
    
    This allows encrypting large amounts of data using the speed of AES,
    while leveraging RSA for key exchange.
    
    Args:
        plaintext: Data to encrypt
        public_key: RSA public key
        
    Returns:
        dict: Contains:
            - encrypted_data: AES encrypted data (base64)
            - encrypted_key: RSA encrypted AES key (base64)
            - nonce: AES nonce (base64)
            - tag: AES authentication tag (base64)
    """
    # Step 1: Encrypt data with AES
    aes_result = aes_encrypt(plaintext)
    
    # Step 2: Encrypt the AES key with RSA
    aes_key_b64 = aes_result["key"]
    encrypted_aes_key = rsa_encrypt(aes_key_b64, public_key)
    
    return {
        "encrypted_data": aes_result["ciphertext"],
        "encrypted_key": encrypted_aes_key,
        "nonce": aes_result["nonce"],
        "tag": aes_result["tag"],
        "algorithm": "Hybrid-AES-256-GCM-RSA-2048"
    }


def hybrid_decrypt(
    encrypted_data: str,
    encrypted_key: str,
    nonce: str,
    tag: str,
    private_key: RSAPrivateKey
) -> str:
    """
    Decrypt hybrid encrypted data.
    
    Args:
        encrypted_data: AES encrypted data (base64)
        encrypted_key: RSA encrypted AES key (base64)
        nonce: AES nonce (base64)
        tag: AES authentication tag (base64)
        private_key: RSA private key
        
    Returns:
        str: Decrypted plaintext
    """
    # Step 1: Decrypt the AES key using RSA
    aes_key_b64 = rsa_decrypt(encrypted_key, private_key)
    aes_key = base64.b64decode(aes_key_b64)
    
    # Step 2: Decrypt the data using AES
    plaintext = aes_decrypt(encrypted_data, aes_key, nonce, tag)
    
    return plaintext


# ============================================================
# Phase 7: ChaCha20-Poly1305 Stream Cipher
# ============================================================

def generate_chacha20_key() -> bytes:
    """
    Generate a random ChaCha20 key (256-bit).
    
    Returns:
        bytes: Random 32-byte key
    """
    return os.urandom(32)


def chacha20_encrypt(
    plaintext: str,
    key: Optional[bytes] = None
) -> Dict[str, str]:
    """
    Encrypt plaintext using ChaCha20-Poly1305 (AEAD cipher).
    
    ChaCha20 is an alternative to AES, often faster on devices without
    AES hardware acceleration (mobile, IoT). Poly1305 provides authentication.
    
    Args:
        plaintext: String to encrypt
        key: ChaCha20 key (generates new key if None)
        
    Returns:
        dict: Contains:
            - ciphertext: Base64 encoded encrypted data
            - key: Base64 encoded key (only if new key was generated)
            - nonce: Base64 encoded nonce (12 bytes)
            - tag: Base64 encoded authentication tag
            - algorithm: "ChaCha20-Poly1305"
    """
    from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
    
    # Generate new key if not provided
    if key is None:
        key = generate_chacha20_key()
        include_key = True
    else:
        include_key = False
    
    # Generate random 96-bit nonce (12 bytes)
    nonce = os.urandom(12)
    
    # Create ChaCha20Poly1305 cipher
    cipher = ChaCha20Poly1305(key)
    
    # Encrypt (returns ciphertext + tag combined)
    plaintext_bytes = plaintext.encode('utf-8')
    ciphertext_and_tag = cipher.encrypt(nonce, plaintext_bytes, None)
    
    # Separate ciphertext and tag (tag is last 16 bytes)
    ciphertext = ciphertext_and_tag[:-16]
    tag = ciphertext_and_tag[-16:]
    
    # Build result dictionary
    result = {
        "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
        "nonce": base64.b64encode(nonce).decode('utf-8'),
        "tag": base64.b64encode(tag).decode('utf-8'),
        "algorithm": "ChaCha20-Poly1305",
    }
    
    if include_key:
        result["key"] = base64.b64encode(key).decode('utf-8')
    
    return result


def chacha20_decrypt(
    ciphertext: str,
    key: bytes,
    nonce: str,
    tag: str
) -> str:
    """
    Decrypt ChaCha20-Poly1305 encrypted data.
    
    Args:
        ciphertext: Base64 encoded ciphertext
        key: ChaCha20 key (32 bytes)
        nonce: Base64 encoded nonce
        tag: Base64 encoded authentication tag
        
    Returns:
        str: Decrypted plaintext
        
    Raises:
        InvalidTag: If authentication fails
    """
    from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
    
    # Decode from base64
    ciphertext_bytes = base64.b64decode(ciphertext)
    nonce_bytes = base64.b64decode(nonce)
    tag_bytes = base64.b64decode(tag)
    
    # Reconstruct ciphertext + tag
    ciphertext_and_tag = ciphertext_bytes + tag_bytes
    
    # Create cipher
    cipher = ChaCha20Poly1305(key)
    
    # Decrypt and verify tag
    try:
        plaintext_bytes = cipher.decrypt(nonce_bytes, ciphertext_and_tag, None)
        return plaintext_bytes.decode('utf-8')
    except InvalidTag:
        raise ValueError("Authentication failed: data may have been tampered with")


# ============================================================
# Phase 7: Elliptic Curve Cryptography (ECC)
# ============================================================

def generate_ecc_keypair(curve_name: str = "P-256"):
    """
    Generate an ECC key pair.
    
    ECC provides equivalent security to RSA with much smaller key sizes:
    - P-256 (256-bit) ≈ RSA-3072
    - P-384 (384-bit) ≈ RSA-7680
    
    Args:
        curve_name: Curve to use ("P-256", "P-384", or "P-521")
        
    Returns:
        tuple: (private_key, public_key)
    """
    from cryptography.hazmat.primitives.asymmetric import ec
    
    curve_map = {
        "P-256": ec.SECP256R1(),
        "P-384": ec.SECP384R1(),
        "P-521": ec.SECP521R1(),
    }
    
    if curve_name not in curve_map:
        raise ValueError(f"Unsupported curve: {curve_name}")
    
    private_key = ec.generate_private_key(curve_map[curve_name], default_backend())
    public_key = private_key.public_key()
    
    return private_key, public_key


def ecc_sign_data(data: str, private_key) -> str:
    """
    Create a digital signature using ECDSA.
    
    Args:
        data: String to sign
        private_key: ECC private key
        
    Returns:
        str: Base64 encoded signature
    """
    from cryptography.hazmat.primitives.asymmetric import ec
    
    data_bytes = data.encode('utf-8')
    
    signature = private_key.sign(
        data_bytes,
        ec.ECDSA(hashes.SHA512())
    )
    
    return base64.b64encode(signature).decode('utf-8')


def ecc_verify_signature(data: str, signature: str, public_key) -> bool:
    """
    Verify an ECDSA signature.
    
    Args:
        data: Original data that was signed
        signature: Base64 encoded signature
        public_key: ECC public key
        
    Returns:
        bool: True if signature is valid
    """
    from cryptography.hazmat.primitives.asymmetric import ec
    
    data_bytes = data.encode('utf-8')
    signature_bytes = base64.b64decode(signature)
    
    try:
        public_key.verify(
            signature_bytes,
            data_bytes,
            ec.ECDSA(hashes.SHA512())
        )
        return True
    except InvalidSignature:
        return False


def serialize_ecc_private_key(private_key, password: Optional[bytes] = None) -> str:
    """
    Serialize ECC private key to PEM format.
    
    Args:
        private_key: ECC private key
        password: Optional password for encryption
        
    Returns:
        str: PEM encoded private key
    """
    if password:
        encryption = serialization.BestAvailableEncryption(password)
    else:
        encryption = serialization.NoEncryption()
    
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption
    )
    
    return pem.decode('utf-8')


def serialize_ecc_public_key(public_key) -> str:
    """
    Serialize ECC public key to PEM format.
    
    Args:
        public_key: ECC public key
        
    Returns:
        str: PEM encoded public key
    """
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return pem.decode('utf-8')


# ============================================================
# Phase 7: SHA-3 Hashing
# ============================================================

def sha3_256_hash(data: str) -> str:
    """
    Compute SHA3-256 hash of data.
    
    SHA-3 is the latest NIST standard hash function, based on the Keccak
    algorithm. It uses a different construction than SHA-2, providing
    additional security margin.
    
    Args:
        data: String to hash
        
    Returns:
        str: Hexadecimal hash digest
    """
    from cryptography.hazmat.primitives.hashes import Hash, SHA3_256
    
    digest = Hash(SHA3_256(), backend=default_backend())
    digest.update(data.encode('utf-8'))
    return digest.finalize().hex()


def sha3_512_hash(data: str) -> str:
    """
    Compute SHA3-512 hash of data.
    
    SHA-3-512 provides higher security level than SHA3-256.
    
    Args:
        data: String to hash
        
    Returns:
        str: Hexadecimal hash digest
    """
    from cryptography.hazmat.primitives.hashes import Hash, SHA3_512
    
    digest = Hash(SHA3_512(), backend=default_backend())
    digest.update(data.encode('utf-8'))
    return digest.finalize().hex()


def verify_hash_sha3(data: str, hash_value: str, algorithm: str = "SHA3-256") -> bool:
    """
    Verify that data matches a SHA-3 hash value.
    
    Args:
        data: Original data
        hash_value: Expected hash (hexadecimal)
        algorithm: Hash algorithm ("SHA3-256" or "SHA3-512")
        
    Returns:
        bool: True if hash matches
        
    Raises:
        ValueError: If algorithm is unsupported
    """
    if algorithm.upper() == "SHA3-256":
        computed_hash = sha3_256_hash(data)
    elif algorithm.upper() == "SHA3-512":
        computed_hash = sha3_512_hash(data)
    else:
        raise ValueError(f"Unsupported SHA-3 algorithm: {algorithm}")
    
    # Constant-time comparison
    return computed_hash == hash_value


# ============================================================
# Algorithm Summary
# ============================================================
"""
Available Cryptographic Algorithms:

Symmetric Encryption:
- AES-128-GCM (moderate security, fast)
- AES-256-GCM (high security, standard)
- ChaCha20-Poly1305 (high security, mobile/IoT optimized)

Asymmetric Encryption:
- RSA-2048 (standard, widely compatible)
- ECC P-256 (equivalent to RSA-3072, smaller keys)
- ECC P-384 (equivalent to RSA-7680, high security)

Hashing:
- SHA-256 (standard, 256-bit)
- SHA-512 (high security, 512-bit)
- SHA3-256 (latest NIST standard)
- SHA3-512 (latest NIST standard, high security)

Digital Signatures:
- RSA-PSS with SHA-512 (standard)
- ECDSA with SHA-512 (smaller signatures, ECC-based)

All algorithms use industry best practices and are NIST-approved.
"""

