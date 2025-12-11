from __future__ import annotations
"""
Policy Pydantic Schemas

Request/response schemas for encryption policy operations.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.models.encryption_policy import MFARequirement


class PolicyBase(BaseModel):
    """Base policy schema."""
    
    encryption_algorithm: str = Field(..., description="Encryption algorithm")
    key_size: int = Field(..., gt=0, description="Key size in bits")
    asymmetric_algorithm: Optional[str] = Field(None, description="Asymmetric algorithm")
    asymmetric_key_size: Optional[int] = Field(None, gt=0, description="Asymmetric key size")
    hash_algorithm: str = Field(..., description="Hash algorithm")
    signature_required: bool = Field(..., description="Whether signature is required")
    mfa_required: MFARequirement = Field(..., description="MFA requirement level")
    description: Optional[str] = Field(None, description="Policy description")


class PolicyCreate(PolicyBase):
    """Schema for creating a new policy."""
    
    sensitivity_level: str = Field(..., description="Target sensitivity level")


class PolicyUpdate(BaseModel):
    """Schema for updating a policy."""
    
    encryption_algorithm: Optional[str] = None
    key_size: Optional[int] = Field(None, gt=0)
    asymmetric_algorithm: Optional[str] = None
    asymmetric_key_size: Optional[int] = Field(None, gt=0)
    hash_algorithm: Optional[str] = None
    signature_required: Optional[bool] = None
    mfa_required: Optional[MFARequirement] = None
    description: Optional[str] = None


class PolicyResponse(PolicyBase):
    """Schema for policy response."""
    
    id: int
    sensitivity_level: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

