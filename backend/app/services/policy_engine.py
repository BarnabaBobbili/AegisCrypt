"""
Policy Engine Service

Manages cryptographic policies and their application based on
sensitivity levels and risk scores.
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.encryption_policy import EncryptionPolicy, MFARequirement
from app.models.data_classification import SensitivityLevel
from app.utils.logger import logger


class PolicyEngineService:
    """
    Service for managing and applying cryptographic policies.
    
    This service determines which cryptographic operations should be
    applied to data based on its sensitivity level.
    """
    
    def __init__(self, db: Session):
        """
        Initialize policy engine service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    def get_policy(self, sensitivity_level: str) -> Optional[EncryptionPolicy]:
        """
        Get policy for a given sensitivity level.
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            EncryptionPolicy: Policy for the sensitivity level, or None
        """
        policy = self.db.query(EncryptionPolicy).filter(
            EncryptionPolicy.sensitivity_level == sensitivity_level.lower()
        ).first()
        
        if not policy:
            logger.warning(f"No policy found for sensitivity level: {sensitivity_level}")
        
        return policy
    
    def get_all_policies(self) -> list[EncryptionPolicy]:
        """
        Get all encryption policies.
        
        Returns:
            list: All encryption policies
        """
        return self.db.query(EncryptionPolicy).all()
    
    def create_default_policies(self) -> None:
        """
        Create default encryption policies for all sensitivity levels.
        
        This should be called during database initialization.
        """
        default_policies = [
            {
                "sensitivity_level": "public",
                "encryption_algorithm": "AES-128-GCM",
                "key_size": 128,
                "hash_algorithm": "SHA-256",
                "signature_required": False,
                "mfa_required": MFARequirement.NONE,
                "description": "Minimal protection for public data"
            },
            {
                "sensitivity_level": "internal",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "hash_algorithm": "SHA-256",
                "signature_required": False,
                "mfa_required": MFARequirement.NONE,
                "description": "Standard protection for internal data"
            },
            {
                "sensitivity_level": "confidential",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "hash_algorithm": "SHA-512",
                "signature_required": True,
                "mfa_required": MFARequirement.CONDITIONAL,
                "description": "Strong protection for confidential data"
            },
            {
                "sensitivity_level": "highly_sensitive",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "asymmetric_algorithm": "RSA-2048",
                "asymmetric_key_size": 2048,
                "hash_algorithm": "SHA-512",
                "signature_required": True,
                "mfa_required": MFARequirement.REQUIRED,
                "description": "Maximum protection for highly sensitive data (hybrid encryption)"
            }
        ]
        
        for policy_data in default_policies:
            # Check if policy already exists
            existing = self.db.query(EncryptionPolicy).filter(
                EncryptionPolicy.sensitivity_level == policy_data["sensitivity_level"]
            ).first()
            
            if not existing:
                policy = EncryptionPolicy(**policy_data)
                self.db.add(policy)
                logger.info(f"Created default policy for {policy_data['sensitivity_level']}")
        
        self.db.commit()
    
    def update_policy(
        self,
        sensitivity_level: str,
        updates: Dict[str, Any]
    ) -> Optional[EncryptionPolicy]:
        """
        Update an encryption policy.
        
        Args:
            sensitivity_level: Target sensitivity level
            updates: Dictionary of fields to update
            
        Returns:
            EncryptionPolicy: Updated policy, or None if not found
        """
        policy = self.get_policy(sensitivity_level)
        
        if not policy:
            return None
        
        for key, value in updates.items():
            if hasattr(policy, key):
                setattr(policy, key, value)
        
        self.db.commit()
        self.db.refresh(policy)
        
        logger.info(f"Updated policy for {sensitivity_level}: {updates}")
        return policy
    
    def requires_signature(self, sensitivity_level: str) -> bool:
        """
        Check if digital signature is required for a sensitivity level.
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            bool: True if signature is required
        """
        policy = self.get_policy(sensitivity_level)
        return policy.signature_required if policy else False
    
    def requires_hybrid_encryption(self, sensitivity_level: str) -> bool:
        """
        Check if hybrid encryption (AES + RSA) is required.
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            bool: True if hybrid encryption is required
        """
        policy = self.get_policy(sensitivity_level)
        return policy.requires_asymmetric if policy else False
    
    def get_hash_algorithm(self, sensitivity_level: str) -> str:
        """
        Get the hash algorithm for a sensitivity level.
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            str: Hash algorithm (default: SHA-256)
        """
        policy = self.get_policy(sensitivity_level)
        return policy.hash_algorithm if policy else "SHA-256"
    
    def get_mfa_requirement(self, sensitivity_level: str) -> MFARequirement:
        """
        Get MFA requirement for a sensitivity level.
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            MFARequirement: MFA requirement level
        """
        policy = self.get_policy(sensitivity_level)
        return policy.mfa_required if policy else MFARequirement.NONE
