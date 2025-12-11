"""
Analytics API Endpoints

Provides audit logs, statistics, and security analytics.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.audit import AuditLogResponse, AuditStatsResponse, SecurityAlertResponse
from app.api.deps import get_current_user, require_admin
from app.services.audit_service import AuditService
from app.utils.logger import logger


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/audit", response_model=list[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    action: Optional[str] = None,
    success_only: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get audit logs.
    
    - Regular users see only their own logs
    - Admins see all logs
    """
    audit_service = AuditService(db)
    
    # Regular users can only see their own logs
    if current_user.role.value != "admin":
        logs = audit_service.get_user_logs(
            user_id=current_user.id,
            limit=limit,
            offset=skip
        )
    else:
        # Admins can see all logs
        logs = audit_service.get_recent_logs(
            limit=limit,
            action=action,
            success_only=success_only
        )
    
    return logs


@router.get("/audit/user/{user_id}", response_model=list[AuditLogResponse])
async def get_user_audit_logs(
    user_id: int,
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get audit logs for a specific user (admin only).
    """
    audit_service = AuditService(db)
    logs = audit_service.get_user_logs(user_id=user_id, limit=limit)
    return logs


@router.get("/stats", response_model=AuditStatsResponse)
async def get_statistics(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get security and usage statistics.
    
    - Available to all users (shows system-wide stats)
    """
    audit_service = AuditService(db)
    stats = audit_service.get_statistics(days=days)
    
    return AuditStatsResponse(**stats)


@router.get("/alerts", response_model=list[SecurityAlertResponse])
async def get_security_alerts(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get recent security alerts (admin only).
    
    - Shows failed logins, high-risk actions, etc.
    """
    audit_service = AuditService(db)
    alerts = audit_service.get_security_alerts(limit=limit)
    
    return [SecurityAlertResponse(**alert) for alert in alerts]


@router.get("/high-risk", response_model=list[AuditLogResponse])
async def get_high_risk_actions(
    threshold: int = Query(61, ge=0, le=100),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get high-risk actions (admin only).
    
    - Shows actions above a risk threshold
    """
    audit_service = AuditService(db)
    logs = audit_service.get_high_risk_logs(threshold=threshold, limit=limit)
    return logs
