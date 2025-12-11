from __future__ import annotations
"""
Classification Pydantic Schemas

Request/response schemas for data classification operations.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

from app.models.data_classification import SensitivityLevel


class ClassificationRequest(BaseModel):
    """Schema for data classification request."""
    
    text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Text content to classify"
    )
    use_ml: bool = Field(
        default=True,
        description="Whether to use ML model (False for rule-based only)"
    )


class ClassificationResponse(BaseModel):
    """Schema for classification response with policy details."""
    
    sensitivity_level: SensitivityLevel = Field(
        ...,
        description="Classified sensitivity level"
    )
    confidence_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="ML model confidence score (0.0 to 1.0)"
    )
    classification_method: str = Field(
        ...,
        description="Classification method used (ml/rule-based/hybrid)"
    )
    policy: Dict[str, Any] = Field(
        ...,
        description="Applicable cryptographic policy"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Classification timestamp"
    )


class DataItemCreate(BaseModel):
    """Schema for creating a new data item."""
    
    content: str = Field(..., description="Original content")
    sensitivity_level: Optional[SensitivityLevel] = Field(
        None,
        description="Manual sensitivity override (auto-classified if not provided)"
    )


class DataItemResponse(BaseModel):
    """Schema for data item response."""
    
    id: int
    sensitivity_level: SensitivityLevel
    confidence_score: Optional[float]
    is_encrypted: bool
    encryption_algorithm: Optional[str]
    is_hashed: bool
    hash_algorithm: Optional[str]
    is_signed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EncryptionRequest(BaseModel):
    """Schema for encryption request."""
    
    text: str = Field(..., min_length=1, description="Text to encrypt")
    sensitivity_level: Optional[SensitivityLevel] = Field(
        None,
        description="Sensitivity level (auto-classified if not provided)"
    )
    save_to_db: bool = Field(
        default=True,
        description="Whether to save encrypted data to database"
    )


class EncryptionResponse(BaseModel):
    """Schema for encryption response."""
    
    data_id: Optional[int] = Field(None, description="Database ID if saved")
    sensitivity_level: SensitivityLevel
    encrypted_data: str = Field(..., description="Base64 encoded encrypted data")
    encryption_algorithm: str
    hash_value: str
    hash_algorithm: str
    signature: Optional[str] = Field(None, description="Digital signature if required")
    nonce: str = Field(..., description="Base64 encoded nonce/IV")
    tag: Optional[str] = Field(None, description="Authentication tag for AEAD")


class DecryptionRequest(BaseModel):
    """Schema for decryption request."""
    
    data_id: int = Field(..., description="ID of encrypted data item")


class DecryptionResponse(BaseModel):
    """Schema for decryption response."""
    
    data_id: int
    decrypted_text: str
    sensitivity_level: SensitivityLevel
    hash_verified: bool = Field(..., description="Whether hash verification passed")
    signature_verified: Optional[bool] = Field(
        None,
        description="Whether signature verification passed (if signed)"
    )

