from __future__ import annotations
"""
Encryption Policy Model

Defines cryptographic policies mapped to sensitivity levels.
Each policy specifies the encryption algorithm, key size, hashing,
signature requirements, and MFA settings.
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Enum
from sqlalchemy.sql import func
import enum

from app.database import Base


class MFARequirement(str, enum.Enum):
    """
    MFA requirement levels for policy enforcement.
    
    - NONE: No MFA required
    - RECOMMENDED: MFA recommended but optional
    - REQUIRED: MFA must be completed
    - CONDITIONAL: MFA based on risk score
    """
    NONE = "none"
    RECOMMENDED = "recommended"
    REQUIRED = "required"
    CONDITIONAL = "conditional"


class EncryptionPolicy(Base):
    """
    Encryption policy model defining cryptographic requirements
    for each sensitivity level.
    
    Policies specify:
    - Which encryption algorithm to use
    - Key sizes for symmetric and asymmetric encryption
    - Hash algorithm requirements
    - Digital signature requirements
    - MFA enforcement level
    
    Attributes:
        id: Primary key
        sensitivity_level: Target sensitivity level (unique)
        encryption_algorithm: Primary encryption algorithm
        key_size: Encryption key size in bits
        asymmetric_algorithm: Asymmetric algorithm for highly sensitive data
        asymmetric_key_size: Asymmetric key size in bits
        hash_algorithm: Hash algorithm to use
        signature_required: Whether digital signature is mandatory
        mfa_required: MFA requirement level
        description: Human-readable policy description
        created_at: Policy creation timestamp
        updated_at: Last update timestamp
    """
    
    __tablename__ = "encryption_policies"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Policy Target
    sensitivity_level = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        comment="Target sensitivity level"
    )
    
    # Symmetric Encryption
    encryption_algorithm = Column(
        String(50),
        nullable=False,
        comment="Primary encryption algorithm (e.g., AES-256-GCM)"
    )
    key_size = Column(
        Integer,
        nullable=False,
        comment="Symmetric key size in bits"
    )
    
    # Asymmetric Encryption (for highly sensitive data)
    asymmetric_algorithm = Column(
        String(50),
        nullable=True,
        comment="Asymmetric algorithm (e.g., RSA-2048)"
    )
    asymmetric_key_size = Column(
        Integer,
        nullable=True,
        comment="Asymmetric key size in bits"
    )
    
    # Hashing
    hash_algorithm = Column(
        String(20),
        nullable=False,
        comment="Hash algorithm (SHA-256, SHA-512)"
    )
    
    # Digital Signature
    signature_required = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether digital signature is required"
    )
    
    # MFA
    mfa_required = Column(
        Enum(MFARequirement),
        default=MFARequirement.NONE,
        nullable=False,
        comment="MFA requirement level"
    )
    
    # Metadata
    description = Column(
        Text,
        nullable=True,
        comment="Human-readable policy description"
    )
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Policy creation timestamp"
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Last update timestamp"
    )
    
    def __repr__(self) -> str:
        return (
            f"<EncryptionPolicy(id={self.id}, "
            f"sensitivity='{self.sensitivity_level}', "
            f"algorithm='{self.encryption_algorithm}')>"
        )
    
    @property
    def requires_asymmetric(self) -> bool:
        """Check if policy requires asymmetric encryption."""
        return (
            self.asymmetric_algorithm is not None
            and self.asymmetric_key_size is not None
        )
    
    def to_dict(self) -> dict:
        """Convert policy to dictionary for API responses."""
        return {
            "id": self.id,
            "sensitivity_level": self.sensitivity_level,
            "encryption_algorithm": self.encryption_algorithm,
            "key_size": self.key_size,
            "asymmetric_algorithm": self.asymmetric_algorithm,
            "asymmetric_key_size": self.asymmetric_key_size,
            "hash_algorithm": self.hash_algorithm,
            "signature_required": self.signature_required,
            "mfa_required": self.mfa_required.value,
            "description": self.description,
        }

