"""
Encryption Service

Handles all encryption, decryption, hashing, and signing operations
based on policy engine recommendations.
"""

from typing import Dict, Any, Optional
import base64
from sqlalchemy.orm import Session

from app.models.data_classification import DataItem, SensitivityLevel
from app.models.user import User
from app.core.crypto import (
    aes_encrypt,
    aes_decrypt,
    sha256_hash,
    sha512_hash,
    verify_hash,
    sign_data,
    verify_signature,
    generate_rsa_keypair,
    hybrid_encrypt,
    hybrid_decrypt,
    serialize_private_key,
    serialize_public_key,
)
from app.services.policy_engine import PolicyEngineService
from app.utils.logger import logger


class EncryptionService:
    """
    Service for encryption, decryption, and cryptographic operations.
    
    Applies cryptographic policies from the policy engine to protect
    data according to its sensitivity level.
    """
    
    def __init__(self, db: Session):
        """
        Initialize encryption service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.policy_engine = PolicyEngineService(db)
        
        # Generate RSA keypair for the service (in production, load from secure storage)
        self.private_key, self.public_key = generate_rsa_keypair(2048)
    
    def encrypt_and_store(
        self,
        content: str,
        sensitivity_level: SensitivityLevel,
        user: User,
        confidence_score: Optional[float] = None
    ) -> DataItem:
        """
        Encrypt data and store it in the database.
        
        Args:
            content: Plaintext content to encrypt
            sensitivity_level: Classified sensitivity level
            user: User encrypting the data
            confidence_score: ML classification confidence score
            
        Returns:
            DataItem: Created data item with encryption metadata
        """
        # Get policy for this sensitivity level
        policy = self.policy_engine.get_policy(sensitivity_level.value)
        
        if not policy:
            raise ValueError(f"No policy found for sensitivity level: {sensitivity_level.value}")
        
        # Determine hash algorithm
        hash_algorithm = policy.hash_algorithm
        
        # Compute hash
        if hash_algorithm == "SHA-512":
            hash_value = sha512_hash(content)
        else:
            hash_value = sha256_hash(content)
        
        # Encrypt data
        if policy.requires_asymmetric:
            # Use hybrid encryption for highly sensitive data
            encryption_result = hybrid_encrypt(content, self.public_key)
            algorithm = encryption_result["algorithm"]
            encrypted_content = encryption_result["encrypted_data"]
            nonce = encryption_result["nonce"]
            tag = encryption_result["tag"]
            # Store the encrypted AES key
            encryption_key_id = encryption_result["encrypted_key"]
        else:
            # Use AES encryption
            encryption_result = aes_encrypt(content)
            algorithm = encryption_result["algorithm"]
            encrypted_content = encryption_result["ciphertext"]
            nonce = encryption_result["nonce"]
            tag = encryption_result["tag"]
            # Store the AES key (already base64 encoded by aes_encrypt)
            if "key" not in encryption_result:
                raise ValueError("AES encryption did not return a key")
            encryption_key_id = encryption_result["key"]
        
        # Generate digital signature if required
        signature = None
        is_signed = False
        if policy.signature_required:
            signature = sign_data(content, self.private_key)
            is_signed = True
        
        # Create data item
        data_item = DataItem(
            user_id=user.id,
            original_content=content,
            sensitivity_level=sensitivity_level,
            confidence_score=confidence_score,
            encrypted_content=encrypted_content,
            encryption_algorithm=algorithm,
            encryption_key_id=encryption_key_id,
            nonce=nonce,
            tag=tag,
            hash_value=hash_value,
            hash_algorithm=hash_algorithm,
            is_signed=is_signed,
            signature=signature,
        )
        
        self.db.add(data_item)
        self.db.commit()
        self.db.refresh(data_item)
        
        logger.info(
            f"Encrypted and stored data item {data_item.id} "
            f"(sensitivity: {sensitivity_level.value}, user: {user.id})"
        )
        
        return data_item
    
    def decrypt_data(self, data_item: DataItem) -> Dict[str, Any]:
        """
        Decrypt a data item and verify integrity.
        
        Args:
            data_item: Data item to decrypt
            
        Returns:
            dict: Contains:
                - decrypted_text: Plaintext content
                - hash_verified: Whether hash verification passed
                - signature_verified: Whether signature verification passed (if signed)
                
        Raises:
            ValueError: If decryption or verification fails
        """
        if not data_item.encrypted_content:
            raise ValueError("Data item is not encrypted")
        
        logger.info(f"Attempting to decrypt data item {data_item.id}, algorithm: {data_item.encryption_algorithm}")
        
        # Decrypt based on algorithm
        if "Hybrid" in data_item.encryption_algorithm:
            # Hybrid decryption
            logger.info("Using hybrid decryption")
            plaintext = hybrid_decrypt(
                encrypted_data=data_item.encrypted_content,
                encrypted_key=data_item.encryption_key_id,
                nonce=data_item.nonce,
                tag=data_item.tag,
                private_key=self.private_key
            )
        else:
            # AES decryption
            logger.info(f"Using AES decryption, key_id length: {len(data_item.encryption_key_id)}")
            # In production, retrieve key from key management service
            try:
                key = base64.b64decode(data_item.encryption_key_id)
                logger.info(f"Decoded key length: {len(key)} bytes")
            except Exception as e:
                logger.error(f"Failed to decode encryption key: {e}")
                raise ValueError(f"Failed to decode encryption key: {e}")
                
            plaintext = aes_decrypt(
                ciphertext=data_item.encrypted_content,
                key=key,
                nonce=data_item.nonce,
                tag=data_item.tag
            )
        
        # Verify hash
        hash_verified = verify_hash(
            plaintext,
            data_item.hash_value,
            data_item.hash_algorithm
        )
        
        if not hash_verified:
            logger.warning(f"Hash verification failed for data item {data_item.id}")
        
        # Verify signature if present
        signature_verified = None
        if data_item.is_signed:
            signature_verified = verify_signature(
                plaintext,
                data_item.signature,
                self.public_key
            )
            
            if not signature_verified:
                logger.warning(f"Signature verification failed for data item {data_item.id}")
        
        logger.info(f"Decrypted data item {data_item.id} (hash_ok: {hash_verified})")
        
        return {
            "decrypted_text": plaintext,
            "hash_verified": hash_verified,
            "signature_verified": signature_verified,
        }
    
    def get_encryption_keys(self) -> Dict[str, str]:
        """
        Get service encryption keys (for admin purposes).
        
        Returns:
            dict: Contains PEM-encoded keys
            
        Warning:
            In production, keys should be stored in a secure key management service
        """
        return {
            "public_key": serialize_public_key(self.public_key),
            "private_key_available": True,  # Don't expose private key
        }
