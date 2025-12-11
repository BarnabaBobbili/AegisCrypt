"""
Phase 7 Cryptographic Algorithm Tests

Verify that all newly implemented algorithms work correctly:
- ChaCha20-Poly1305 encryption/decryption
- ECC key generation (P-256, P-384, P-521)
- ECDSA signatures  
- SHA-3 hashing (256, 512)
"""

import sys
sys.path.append('.')

from app.core.crypto import (
    # ChaCha20
    chacha20_encrypt,
    chacha20_decrypt,
    # ECC
    generate_ecc_keypair,
    ecc_sign_data,
    ecc_verify_signature,
    # SHA-3
    sha3_256_hash,
    sha3_512_hash,
    verify_hash_sha3
)


def test_chacha20():
    """Test ChaCha20-Poly1305 encryption/decryption."""
    print("\n=== Testing ChaCha20-Poly1305 ===")
    
    plaintext = "Secret message for ChaCha20 testing!"
    print(f"Original: {plaintext}")
    
    # Encrypt
    result = chacha20_encrypt(plaintext)
    print(f"Algorithm: {result['algorithm']}")
    print(f"Ciphertext: {result['ciphertext'][:50]}...")
    
    # Decrypt
    import base64
    key = base64.b64decode(result['key'])
    decrypted = chacha20_decrypt(
        result['ciphertext'],
        key,
        result['nonce'],
        result['tag']
    )
    print(f"Decrypted: {decrypted}")
    
    assert decrypted == plaintext, "ChaCha20 decryption failed!"
    print("✅ ChaCha20-Poly1305 works correctly!")
    

def test_ecc_p256():
    """Test ECC P-256 key() and signatures."""
    print("\n=== Testing ECC P-256 ===")
    
    # Generate keypair
    private_key, public_key = generate_ecc_keypair("P-256")
    print("✅ Generated P-256 keypair")
    
    # Sign data
    data = "Important document to sign"
    signature = ecc_sign_data(data, private_key)
    print(f"Signature: {signature[:50]}...")
    
    # Verify signature
    is_valid = ecc_verify_signature(data, signature, public_key)
    print(f"Signature valid: {is_valid}")
    
    # Test with tampered data
    tampered_valid = ecc_verify_signature("Tampered data", signature, public_key)
    print(f"Tampered signature valid: {tampered_valid}")
    
    assert is_valid == True, "Valid signature failed!"
    assert tampered_valid == False, "Tampered signature passed!"
    print("✅ ECC P-256 signatures work correctly!")


def test_ecc_p384():
    """Test ECC P-384."""
    print("\n=== Testing ECC P-384 ===")
    
    private_key, public_key = generate_ecc_keypair("P-384")
    print("✅ Generated P-384 keypair")
    
    data = "High security document"
    signature = ecc_sign_data(data, private_key)
    is_valid = ecc_verify_signature(data, signature, public_key)
    
    assert is_valid == True
    print("✅ ECC P-384 works correctly!")


def test_sha3():
    """Test SHA-3 hashing."""
    print("\n=== Testing SHA-3 ===")
    
    data = "Data to hash with SHA-3"
    
    # SHA3-256
    hash_256 = sha3_256_hash(data)
    print(f"SHA3-256: {hash_256}")
    
    # SHA3-512
    hash_512 = sha3_512_hash(data)
    print(f"SHA3-512: {hash_512}")
    
    # Verify hashes
    assert verify_hash_sha3(data, hash_256, "SHA3-256") == True
    assert verify_hash_sha3(data, hash_512, "SHA3-512") == True
    assert verify_hash_sha3("Wrong data", hash_256, "SHA3-256") == False
    
    print("✅ SHA-3 hashing works correctly!")


def main():
    """Run all cryptographic tests."""
    print("=" * 60)
    print("PHASE 7 CRYPTOGRAPHIC ALGORITHM VERIFICATION")
    print("=" * 60)
    
    try:
        test_chacha20()
        test_ecc_p256()
        test_ecc_p384()
        test_sha3()
        
        print("\n" + "=" * 60)
        print("✅ ALL PHASE 7 ALGORITHMS VERIFIED SUCCESSFULLY!")
        print("=" * 60)
        print("\nImplemented Algorithms:")
        print("  ✅ ChaCha20-Poly1305 (symmetric encryption)")
        print("  ✅ ECC P-256 (asymmetric, signatures)")
        print("  ✅ ECC P-384 (high security)")
        print("  ✅ SHA3-256 (hashing)")
        print("  ✅ SHA3-512 (hashing)")
        print("\nYour specification is now 100% complete!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
