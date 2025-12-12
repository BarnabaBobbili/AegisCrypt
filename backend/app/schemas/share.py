"""
Share Schemas

Pydantic schemas for public file encryption and sharing endpoints.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SensitivityLevel(str, Enum):
    """Data sensitivity levels."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    HIGHLY_SENSITIVE = "highly_sensitive"


# Classification Schemas

class ClassifyRequest(BaseModel):
    """Request to classify text/file for sensitivity."""
    text: str = Field(..., min_length=1, max_length=1000000, description="Text content to classify")


class FeatureImportance(BaseModel):
    """Feature importance for explainability."""
    feature: str
    importance: float
    description: Optional[str] = None


class DetectedPattern(BaseModel):
    """Detected sensitive pattern in text."""
    type: str
    count: int
    confidence: float
    examples: list[str]
    contribution: float
    severity: str


class SensitiveRegion(BaseModel):
    """Highlighted sensitive region in text."""
    start: int
    end: int
    type: str
    severity: str
    text: str


class ClassifyResponse(BaseModel):
    """Response from classification endpoint."""
    sensitivity_level: SensitivityLevel
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    explanation: Optional[str] = None
    detected_patterns: Optional[list[DetectedPattern]] = None
    feature_importance: Optional[list[FeatureImportance]] = None
    highlighted_regions: Optional[list[SensitiveRegion]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "sensitivity_level": "confidential",
                "confidence_score": 0.87,
                "explanation": "Document contains Social Security Number, Medical Terms, classified as confidential",
                "detected_patterns": [
                    {
                        "type": "ssn",
                        "count": 2,
                        "confidence": 0.95,
                        "examples": ["XXX-XX-XXXX"],
                        "contribution": 0.45,
                        "severity": "high"
                    }
                ],
                "feature_importance": [
                    {"feature": "Social Security Number", "importance": 0.45, "description": "SSN patterns detected"},
                    {"feature": "Medical Terms", "importance": 0.28, "description": "Medical terminology found"}
                ],
                "highlighted_regions": [
                    {"start": 45, "end": 56, "type": "ssn", "severity": "high", "text": "XXX-XX-XXXX"}
                ]
            }
        }


# Public Encryption Schemas

class PublicEncryptRequest(BaseModel):
    """Request to encrypt file for public sharing."""
    content: str = Field(..., description="File content (base64 encoded)")
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: Optional[str] = "application/octet-stream"
    
    # Optional overrides
    sensitivity_level: Optional[SensitivityLevel] = None
    
    # Access control
    password: Optional[str] = Field(None, min_length=4, max_length=100)
    expiration_hours: Optional[int] = Field(None, gt=0, le=8760, description="Link expiration (max 1 year)")
    max_downloads: Optional[int] = Field(None, gt=0, le=1000)
    
    @field_validator('expiration_hours')
    def validate_expiration(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Expiration hours must be positive')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "SGVsbG8gV29ybGQh",  # base64("Hello World!")
                "filename": "document.txt",
                "password": "my_secure_password",
                "expiration_hours": 168,  # 7 days
                "max_downloads": 10
            }
        }


class PublicEncryptResponse(BaseModel):
    """Response from public encryption endpoint."""
    share_token: str
    share_url: str
    sensitivity_level: SensitivityLevel
    confidence_score: Optional[float] = None
    expires_at: Optional[datetime] = None
    max_downloads: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "share_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
                "share_url": "http://localhost:3000/share/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
                "sensitivity_level": "confidential",
                "confidence_score": 0.87,
                "expires_at": "2025-12-19T22:00:00Z",
                "max_downloads": 10
            }
        }


# Share Info Schemas

class ShareInfoResponse(BaseModel):
    """Metadata about a share link (without revealing content)."""
    filename: str
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    max_downloads: Optional[int] = None
    download_count: int
    requires_password: bool
    is_expired: bool
    is_available: bool
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "document.txt",
                "file_size": 1024,
                "content_type": "text/plain",
                "created_at": "2025-12-12T22:00:00Z",
                "expires_at": "2025-12-19T22:00:00Z",
                "max_downloads": 10,
                "download_count": 3,
                "requires_password": True,
                "is_expired": False,
                "is_available": True
            }
        }


# Decryption Schemas

class DecryptRequest(BaseModel):
    """Request to decrypt a shared file."""
    password: Optional[str] = Field(None, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "password": "my_secure_password"
            }
        }


class DecryptResponse(BaseModel):
    """Response from decryption endpoint."""
    content: str = Field(..., description="Decrypted file content (base64)")
    filename: str
    content_type: str
    hash_verified: bool
    merkle_verified: bool = Field(default=False, description="Merkle tree integrity verification result")
    sensitivity_level: SensitivityLevel
    remaining_downloads: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "SGVsbG8gV29ybGQh",
                "filename": "document.txt",
                "content_type": "text/plain",
                "hash_verified": True,
                "merkle_verified": True,
                "sensitivity_level": "confidential",
                "remaining_downloads": 7
            }
        }
