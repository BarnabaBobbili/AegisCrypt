from __future__ import annotations
"""
Audit Log Pydantic Schemas

Request/response schemas for audit logging and analytics.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AuditLogBase(BaseModel):
    """Base audit log schema."""
    
    action: str
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    success: bool
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(AuditLogBase):
    """Schema for audit log response."""
    
    id: int
    user_id: Optional[int]
    data_id: Optional[int]
    mfa_required: bool
    mfa_completed: bool
    request_path: Optional[str]
    request_method: Optional[str]
    status_code: Optional[int]
    failure_reason: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class AuditStatsResponse(BaseModel):
    """Schema for audit statistics response."""
    
    total_actions: int = Field(..., description="Total number of actions")
    successful_actions: int = Field(..., description="Number of successful actions")
    failed_actions: int = Field(..., description="Number of failed actions")
    high_risk_actions: int = Field(..., description="Number of high-risk actions")
    mfa_enforced: int = Field(..., description="Number of times MFA was enforced")
    unique_users: int = Field(..., description="Number of unique users")
    unique_ips: int = Field(..., description="Number of unique IP addresses")
    
    # Action breakdown
    login_attempts: int = 0
    login_successes: int = 0
    login_failures: int = 0
    classifications: int = 0
    encryptions: int = 0
    decryptions: int = 0


class SecurityAlertResponse(BaseModel):
    """Schema for security alert."""
    
    alert_type: str = Field(..., description="Type of security alert")
    severity: str = Field(..., description="Alert severity (low/medium/high/critical)")
    message: str = Field(..., description="Alert message")
    user_id: Optional[int] = None
    username: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    risk_score: Optional[int] = None
    action: Optional[str] = None

