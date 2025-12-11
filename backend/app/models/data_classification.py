from __future__ import annotations
"""
Data Classification Model

Stores classified and encrypted data items with their sensitivity levels,
encryption metadata, and cryptographic operations applied.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class SensitivityLevel(str, enum.Enum):
    """
    Data sensitivity classification levels.
    
    Levels determine the cryptographic policy applied:
    - PUBLIC: General information, no strict protection required
    - INTERNAL: Company-internal data, moderate protection
    - CONFIDENTIAL: Sensitive business data, strong protection
    - HIGHLY_SENSITIVE: Critical data (PII, credentials), maximum protection
    """
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    HIGHLY_SENSITIVE = "highly_sensitive"


class DataItem(Base):
    """
    Data item model for classified and encrypted data.
    
    Each data item represents a piece of classified information
    with associated cryptographic metadata.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to user who created this item
        original_content: Original plaintext content
        sensitivity_level: AI-classified sensitivity level
        confidence_score: ML model confidence (0.0 to 1.0)
        encrypted_content: Encrypted version of the content
        encryption_algorithm: Algorithm used (e.g., AES-256-GCM)
        encryption_key_id: Reference to encryption key (for key management)
        nonce: Nonce/IV used for encryption (stored as base64)
        tag: Authentication tag (for authenticated encryption)
        hash_value: Hash of the original content
        hash_algorithm: Hash algorithm used (SHA-256, SHA-512)
        is_signed: Whether data has a digital signature
        signature: Digital signature (stored as base64)
        created_at: Creation timestamp
        updated_at: Last update timestamp
        
    Relationships:
        user: User who owns this data item
        audit_logs: Audit log entries related to this data
    """
    
    __tablename__ = "data_items"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Key
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User who owns this data"
    )
    
    # Content
    original_content = Column(
        Text,
        nullable=False,
        comment="Original plaintext content"
    )
    
    # Classification
    sensitivity_level = Column(
        Enum(SensitivityLevel),
        nullable=False,
        index=True,
        comment="AI-classified sensitivity level"
    )
    confidence_score = Column(
        Float,
        nullable=True,
        comment="ML model confidence score (0.0 to 1.0)"
    )
    
    # Encryption Metadata
    encrypted_content = Column(
        Text,
        nullable=True,
        comment="Encrypted content (base64 encoded)"
    )
    encryption_algorithm = Column(
        String(50),
        nullable=True,
        comment="Encryption algorithm used (e.g., AES-256-GCM)"
    )
    encryption_key_id = Column(
        Text,
        nullable=True,
        comment="Reference to encryption key (or encrypted key for hybrid)"
    )
    nonce = Column(
        String(255),
        nullable=True,
        comment="Nonce/IV for encryption (base64)"
    )
    tag = Column(
        String(255),
        nullable=True,
        comment="Authentication tag for AEAD (base64)"
    )
    
    # Hashing
    hash_value = Column(
        String(128),
        nullable=True,
        comment="Hash of original content (hex)"
    )
    hash_algorithm = Column(
        String(20),
        nullable=True,
        comment="Hash algorithm (SHA-256, SHA-512)"
    )
    
    # Digital Signature
    is_signed = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether data has digital signature"
    )
    signature = Column(
        Text,
        nullable=True,
        comment="Digital signature (base64)"
    )
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Creation timestamp"
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Last update timestamp"
    )
    
    # Relationships
    user = relationship("User", back_populates="data_items")
    audit_logs = relationship(
        "AuditLog",
        back_populates="data_item",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return (
            f"<DataItem(id={self.id}, "
            f"sensitivity='{self.sensitivity_level.value}', "
            f"user_id={self.user_id})>"
        )
    
    @property
    def is_encrypted(self) -> bool:
        """Check if data item is encrypted."""
        return self.encrypted_content is not None and self.encryption_algorithm is not None
    
    @property
    def is_hashed(self) -> bool:
        """Check if data item has hash."""
        return self.hash_value is not None and self.hash_algorithm is not None

