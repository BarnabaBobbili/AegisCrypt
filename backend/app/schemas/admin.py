"""
Admin Schemas

Pydantic models for admin operations including user management and system statistics.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserCreateRequest(BaseModel):
    """Schema for creating a new user (admin only)."""
    
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    role: UserRole = Field(default=UserRole.USER, description="User role")
    is_active: bool = Field(default=True, description="Whether user is active")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "SecurePass@123",
                "role": "user",
                "is_active": True
            }
        }


class UserUpdateRequest(BaseModel):
    """Schema for updating an existing user (admin only)."""
    
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    mfa_enabled: Optional[bool] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "updated@example.com",
                "role": "manager",
                "is_active": True
            }
        }


class RoleUpdateRequest(BaseModel):
    """Schema for updating user role."""
    
    role: UserRole = Field(..., description="New role for the user")
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "manager"
            }
        }


class UserListResponse(BaseModel):
    """Schema for user list item."""
    
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    
    class Config:
        from_attributes = True


class SystemStatsResponse(BaseModel):
    """Schema for system-wide statistics (admin only)."""
    
    # User statistics
    total_users: int = Field(..., description="Total number of users")
    active_users: int = Field(..., description="Number of active users")
    users_by_role: dict = Field(..., description="User count per role")
    
    # Data statistics
    total_data_items: int = Field(..., description="Total encrypted data items")
    data_by_sensitivity: dict = Field(..., description="Data count per sensitivity level")
    
    # Activity statistics
    total_operations: int = Field(..., description="Total operations performed")
    recent_activity: int = Field(..., description="Activity in last 24 hours")
    
    # Security statistics
    total_audit_logs: int = Field(..., description="Total audit log entries")
    failed_logins_24h: int = Field(..., description="Failed logins in last 24 hours")
    high_risk_actions_24h: int = Field(..., description="High-risk actions in last 24 hours")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_users": 10,
                "active_users": 8,
                "users_by_role": {"admin": 1, "manager": 2, "user": 5, "guest": 2},
                "total_data_items": 150,
                "data_by_sensitivity": {"public": 50, "internal": 60, "confidential": 30, "highly_sensitive": 10},
                "total_operations": 500,
                "recent_activity": 45,
                "total_audit_logs": 1000,
                "failed_logins_24h": 3,
                "high_risk_actions_24h": 2
            }
        }
