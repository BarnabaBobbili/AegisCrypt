"""
Admin API Endpoints

Administrative endpoints for user management and system statistics.
Accessible only to users with Admin role.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole
from app.models.data_classification import DataItem, SensitivityLevel
from app.models.audit_log import AuditLog
from app.schemas.admin import (
    UserCreateRequest,
    UserUpdateRequest,
    RoleUpdateRequest,
    UserListResponse,
    SystemStatsResponse
)
from app.core.security import hash_password
from app.api.deps import get_current_user, require_role
from app.utils.logger import logger


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserListResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    List all users in the system (Admin only).
    
    Returns user details including role, status, and login information.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    logger.info(f"Admin {current_user.username} listed {len(users)} users")
    return users


@router.post("/users", response_model=UserListResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreateRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Create a new user (Admin only).
    
    Creates a new user with specified role and credentials.
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        is_active=user_data.is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Admin {current_user.username} created new user: {new_user.username} (role: {new_user.role.value})")
    return new_user


@router.put("/users/{user_id}", response_model=UserListResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update an existing user (Admin only).
    
    Updates user details such as email, role, active status, etc.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields if provided
    update_data = user_data.dict(exclude_unset=True)
    
    if "email" in update_data:
        # Check email uniqueness
        existing = db.query(User).filter(
            User.email == update_data["email"],
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        user.email = update_data["email"]
    
    if "password" in update_data:
        user.password_hash = hash_password(update_data["password"])
    
    if "role" in update_data:
        user.role = update_data["role"]
    
    if "is_active" in update_data:
        user.is_active = update_data["is_active"]
    
    if "mfa_enabled" in update_data:
        user.mfa_enabled = update_data["mfa_enabled"]
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"Admin {current_user.username} updated user: {user.username}")
    return user


@router.put("/users/{user_id}/role", response_model=UserListResponse)
async def update_user_role(
    user_id: int,
    role_data: RoleUpdateRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update user role (Admin only).
    
    Changes the role of a specified user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from removing their own admin role
    if user.id == current_user.id and role_data.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin role"
        )
    
    old_role = user.role.value
    user.role = role_data.role
    db.commit()
    db.refresh(user)
    
    logger.info(f"Admin {current_user.username} changed role of {user.username}: {old_role} -> {role_data.role.value}")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Delete a user (Admin only).
    
    Permanently removes a user from the system.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    username = user.username
    db.delete(user)
    db.commit()
    
    logger.info(f"Admin {current_user.username} deleted user: {username}")
    return None


@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get system-wide statistics (Admin only).
    
    Returns comprehensive statistics about users, data, and system activity.
    """
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    users_by_role = {}
    for role in UserRole:
        count = db.query(User).filter(User.role == role).count()
        users_by_role[role.value] = count
    
    # Data statistics
    total_data_items = db.query(DataItem).count()
    
    data_by_sensitivity = {}
    for level in SensitivityLevel:
        count = db.query(DataItem).filter(DataItem.sensitivity_level == level.value).count()
        data_by_sensitivity[level.value] = count
    
    # Activity statistics
    total_operations = db.query(AuditLog).count()
    
    # Recent activity (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_activity = db.query(AuditLog).filter(
        AuditLog.timestamp >= yesterday
    ).count()
    
    # Security statistics
    total_audit_logs = total_operations
    
    failed_logins_24h = db.query(AuditLog).filter(
        AuditLog.action == "login_failed",
        AuditLog.timestamp >= yesterday
    ).count()
    
    high_risk_actions_24h = db.query(AuditLog).filter(
        AuditLog.risk_score >= 61,
        AuditLog.timestamp >= yesterday
    ).count()
    
    stats = SystemStatsResponse(
        total_users=total_users,
        active_users=active_users,
        users_by_role=users_by_role,
        total_data_items=total_data_items,
        data_by_sensitivity=data_by_sensitivity,
        total_operations=total_operations,
        recent_activity=recent_activity,
        total_audit_logs=total_audit_logs,
        failed_logins_24h=failed_logins_24h,
        high_risk_actions_24h=high_risk_actions_24h
    )
    
    logger.info(f"Admin {current_user.username} retrieved system statistics")
    return stats
