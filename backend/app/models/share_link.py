"""
Share Link Model

Defines the ShareLink database model for public file encryption and sharing.
Enables unauthenticated users to encrypt and share files via cryptographic links.
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import uuid

from app.database import Base


class ShareLink(Base):
    """
    Share link model for public encrypted file sharing.
    
    Each share link represents an encrypted file that can be accessed
    via a unique cryptographic token. Supports password protection,
    expiration times, and download limits.
    
    Attributes:
        id: UUID primary key
        share_token: Cryptographically random 32-character URL-safe token
        encrypted_content: Base64-encoded encrypted file data
        encryption_algorithm: Algorithm used (e.g., AES-256-GCM)
        nonce: Encryption nonce/IV (base64)
        tag: Authentication tag for AEAD (base64)
        encryption_key: Encrypted symmetric key (base64)
        hash_value: SHA-256 hash of plaintext for integrity verification
        hash_algorithm: Hash algorithm used (e.g., SHA-256)
        password_hash: Optional PBKDF2 hash for password protection
        sensitivity_level: AI-classified sensitivity level
        confidence_score: ML classifier confidence (0.0-1.0)
        expiration_time: Optional expiration timestamp
        max_downloads: Optional maximum download limit
        download_count: Current number of downloads
        created_at: Link creation timestamp
        last_accessed: Last download timestamp
        metadata: JSON field for filename, size, content type, etc.
        is_active: Whether link is still active
    """
    
    __tablename__ = "share_links"
    
    # Primary Key - using UUID for unpredictability
    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        comment="UUID primary key"
    )
    
    # Share Token - cryptographically random 32-char token
    share_token = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique share token for URL access"
    )
    
    # Encrypted Content
    encrypted_content = Column(
        Text,
        nullable=False,
        comment="Base64-encoded encrypted file data"
    )
    
    # Encryption Metadata
    encryption_algorithm = Column(
        String(50),
        nullable=False,
        comment="Encryption algorithm used"
    )
    nonce = Column(
        String(255),
        nullable=False,
        comment="Encryption nonce/IV (base64)"
    )
    tag = Column(
        String(255),
        nullable=False,
        comment="Authentication tag for AEAD (base64)"
    )
    encryption_key = Column(
        String(1024),
        nullable=False,
        comment="Encrypted symmetric key (base64)"
    )
    
    # Integrity Verification
    hash_value = Column(
        String(255),
        nullable=False,
        comment="Hash of plaintext for integrity"
    )
    hash_algorithm = Column(
        String(20),
        nullable=False,
        default="SHA-256",
        comment="Hash algorithm used"
    )
    
    # Password Protection (optional)
    password_hash = Column(
        String(255),
        nullable=True,
        comment="PBKDF2 hash for password protection"
    )
    
    # AI Classification
    sensitivity_level = Column(
        String(50),
        nullable=False,
        comment="AI-classified sensitivity level"
    )
    confidence_score = Column(
        String(10),
        nullable=True,
        comment="ML classifier confidence score"
    )
    
    # Access Control
    expiration_time = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Optional expiration timestamp"
    )
    max_downloads = Column(
        Integer,
        nullable=True,
        comment="Optional maximum download limit"
    )
    download_count = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Current download count"
    )
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Link creation timestamp"
    )
    last_accessed = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last download timestamp"
    )
    
    # Metadata (JSON)
    file_metadata = Column(
        JSON,
        nullable=True,
        comment="File metadata (name, size, content_type)"
    )
    
    # Merkle Tree Integrity (Phase 2)
    merkle_root = Column(
        String(64),
        nullable=True,
        comment="Merkle tree root hash for integrity verification"
    )
    chunk_size = Column(
        Integer,
        default=4096,
        nullable=True,
        comment="Chunk size used for Merkle tree (bytes)"
    )
    
    # Status
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether link is still active"
    )
    
    def __repr__(self) -> str:
        return f"<ShareLink(token='{self.share_token[:8]}...', active={self.is_active})>"
    
    def is_expired(self) -> bool:
        """Check if share link has expired."""
        if not self.expiration_time:
            return False
        return datetime.now(self.expiration_time.tzinfo) > self.expiration_time
    
    def is_download_limit_reached(self) -> bool:
        """Check if download limit has been reached."""
        if not self.max_downloads:
            return False
        return self.download_count >= self.max_downloads
    
    def can_access(self) -> bool:
        """Check if share link can be accessed."""
        return (
            self.is_active
            and not self.is_expired()
            and not self.is_download_limit_reached()
        )
