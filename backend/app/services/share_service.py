"""
Share Service

Handles creation and management of public encrypted file shares.
Implements cryptographic share links with password protection and access control.
"""

from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import base64
import hashlib

from app.models.share_link import ShareLink
from app.core.crypto import (
    aes_encrypt,
    aes_decrypt,
    generate_aes_key,
    sha256_hash,
    verify_hash,
)
from app.schemas.share import SensitivityLevel
from app.utils.logger import logger


class ShareService:
    """
    Service for managing encrypted file shares.
    
    Provides functionality to create share links, decrypt shares,
    manage access control (passwords, expiration, download limits),
    and cleanup expired shares.
    """
    
    def __init__(self, db: Session):
        """Initialize share service with database session."""
        self.db = db
    
    def _generate_share_token(self) -> str:
        """
        Generate a cryptographically secure share token.
        
        Returns 32 URL-safe characters (192 bits of entropy).
        """
        # Generate 24 random bytes, encode as URL-safe base64 (32 chars)
        token = secrets.token_urlsafe(24)
        return token
    
    def _hash_password(self, password: str) -> str:
        """
        Hash password using PBKDF2 with SHA-256.
        
        Uses 600,000 iterations as recommended by OWASP (2023).
        """
        salt = secrets.token_bytes(32)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            600000  # OWASP recommended iterations
        )
        # Store salt + hash
        return base64.b64encode(salt + key).decode('utf-8')
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against stored hash."""
        try:
            decoded = base64.b64decode(password_hash.encode('utf-8'))
            salt = decoded[:32]
            stored_key = decoded[32:]
            
            key = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt,
                600000
            )
            
            # Constant-time comparison
            return secrets.compare_digest(key, stored_key)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def create_share_link(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        sensitivity_level: SensitivityLevel,
        confidence_score: Optional[float] = None,
        password: Optional[str] = None,
        expiration_hours: Optional[int] = None,
        max_downloads: Optional[int] = None,
    ) -> ShareLink:
        """
        Create an encrypted share link.
        
        Args:
            content: Raw file content (bytes)
            filename: Original filename
            content_type: MIME type
            sensitivity_level: AI-classified sensitivity
            confidence_score: ML classifier confidence
            password: Optional password for access control
            expiration_hours: Optional expiration time in hours
            max_downloads: Optional download limit
            
        Returns:
            ShareLink: Created share link object
        """
        logger.info(f"Creating share link for file: {filename} ({len(content)} bytes)")
        
        # Generate encryption key
        encryption_key = generate_aes_key(256)
        
        # Convert bytes to string for encryption
        content_str = content.decode('latin-1')  # Use latin-1 to preserve bytes
        
        # Encrypt content
        result = aes_encrypt(plaintext=content_str, key=encryption_key)
       
        # Hash plaintext for integrity verification
        hash_value = sha256_hash(content_str)
        
        # Generate Merkle tree for advanced integrity (Phase 2)
        from app.services.integrity_service import IntegrityService
        merkle_tree = IntegrityService.create_merkle_tree(content)
        merkle_root = merkle_tree.get_root()
        tree_chunk_size = merkle_tree.chunk_size
        
        logger.info(f"Generated Merkle tree: root={merkle_root[:16]}..., chunks={len(merkle_tree.chunks)}")
        
        # Generate unique share token
        share_token = self._generate_share_token()
        
        # Calculate expiration time
        expiration_time = None
        if expiration_hours:
            expiration_time = datetime.utcnow() + timedelta(hours=expiration_hours)
        
        # Hash password if provided
        password_hash_value = None
        if password:
            password_hash_value = self._hash_password(password)
        
        # Create share link record
        share_link = ShareLink(
            share_token=share_token,
            encrypted_content=result['ciphertext'],
            encryption_algorithm="AES-256-GCM",
            nonce=result['nonce'],
            tag=result['tag'],
            encryption_key=base64.b64encode(encryption_key).decode('utf-8'),
            hash_value=hash_value,
            hash_algorithm="SHA-256",
            password_hash=password_hash_value,
            sensitivity_level=sensitivity_level.value,
            confidence_score=str(confidence_score) if confidence_score else None,
            expiration_time=expiration_time,
            max_downloads=max_downloads,
            file_metadata={
                "filename": filename,
                "content_type": content_type,
                "file_size": len(content),
            },
            merkle_root=merkle_root,
            chunk_size=tree_chunk_size,
        )
        
        self.db.add(share_link)
        self.db.commit()
        self.db.refresh(share_link)
        
        logger.info(f"Created share link: {share_token}")
        return share_link
    
    def get_share_by_token(self, token: str) -> Optional[ShareLink]:
        """
        Retrieve share link by token.
        
        Args:
            token: Share token
            
        Returns:
            ShareLink if found, None otherwise
        """
        return self.db.query(ShareLink).filter(
            ShareLink.share_token == token
        ).first()
    
    def decrypt_share(
        self,
        share_link: ShareLink,
        password: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Decrypt a share link's content.
        
        Args:
            share_link: Share link to decrypt
            password: Password if required
            
        Returns:
            dict: Contains decrypted content and metadata
            
        Raises:
            ValueError: If access denied, password wrong, or verification fails
        """
        # Check if share is accessible
        if not share_link.can_access():
            if share_link.is_expired():
                raise ValueError("Share link has expired")
            if share_link.is_download_limit_reached():
                raise ValueError("Download limit reached")
            if not share_link.is_active:
                raise ValueError("Share link is no longer active")
        
        # Verify password if required
        if share_link.password_hash:
            if not password:
                raise ValueError("Password required")
            if not self._verify_password(password, share_link.password_hash):
                raise ValueError("Incorrect password")
        
        logger.info(f"Decrypting share link: {share_link.share_token}")
        
        # Get encrypted data (already base64)
        key = base64.b64decode(share_link.encryption_key)
        
        # Decrypt
        try:
            plaintext_str = aes_decrypt(
                ciphertext=share_link.encrypted_content,
                key=key,
                nonce=share_link.nonce,
                tag=share_link.tag
            )
            # Convert back to bytes (was encoded as latin-1)
            plaintext = plaintext_str.encode('latin-1')
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError(f"Decryption failed: {str(e)}")
        
        # Verify hash
        hash_verified = verify_hash(
            plaintext_str,
            share_link.hash_value,
            share_link.hash_algorithm
        )
        
        if not hash_verified:
            logger.warning(f"Hash verification failed for {share_link.share_token}")
        
        # Verify Merkle tree integrity (Phase 2)
        merkle_verified = self.verify_merkle_integrity(share_link, plaintext)
        
        # Update access tracking
        self.increment_download_count(share_link)
        
        return {
            "content": plaintext,
            "filename": share_link.file_metadata.get("filename", "download"),
            "content_type": share_link.file_metadata.get("content_type", "application/octet-stream"),
            "hash_verified": hash_verified,
            "merkle_verified": merkle_verified,
            "sensitivity_level": share_link.sensitivity_level,
            "remaining_downloads": (
                share_link.max_downloads - share_link.download_count
                if share_link.max_downloads
                else None
            ),
        }
    
    def increment_download_count(self, share_link: ShareLink) -> None:
        """Increment download counter and update last accessed time."""
        share_link.download_count += 1
        share_link.last_accessed = datetime.utcnow()
        self.db.commit()
        logger.info(
            f"Share {share_link.share_token}: download count = {share_link.download_count}"
        )
    
    def cleanup_expired_shares(self) -> int:
        """
        Delete expired and inactive share links.
        
        Returns:
            int: Number of deleted shares
        """
        now = datetime.utcnow()
        
        # Find expired shares
        expired_shares = self.db.query(ShareLink).filter(
            ShareLink.is_active == True,
            ShareLink.expiration_time.isnot(None),
            ShareLink.expiration_time < now
        ).all()
        
        count = len(expired_shares)
        
        for share in expired_shares:
            share.is_active = False
        
        self.db.commit()
        
        logger.info(f"Cleaned up {count} expired shares")
        return count
    
    def deactivate_share(self, token: str) -> bool:
        """
        Manually deactivate a share link.
        
        Args:
            token: Share token to deactivate
            
        Returns:
            bool: True if deactivated, False if not found
        """
        share_link = self.get_share_by_token(token)
        if not share_link:
            return False
        
        share_link.is_active = False
        self.db.commit()
        
        logger.info(f"Deactivated share link: {token}")
        return True
    
    def verify_merkle_integrity(self, share_link: ShareLink, content: bytes) -> bool:
        """
        Verify file integrity using Merkle tree.
        
        Args:
            share_link: Share link with Merkle root
            content: Decrypted content to verify
            
        Returns:
            bool: True if Merkle verification passes
        """
        if not share_link.merkle_root:
            logger.warning(f"No Merkle root for {share_link.share_token}")
            return False
        
        from app.services.integrity_service import IntegrityService
        
        is_valid = IntegrityService.verify_integrity(
            content=content,
            expected_root=share_link.merkle_root,
            chunk_size=share_link.chunk_size or 4096
        )
        
        if is_valid:
            logger.info(f"Merkle verification passed for {share_link.share_token}")
        else:
            logger.warning(f"Merkle verification FAILED for {share_link.share_token}")
        
        return is_valid
