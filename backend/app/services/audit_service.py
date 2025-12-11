"""
Audit Service

Handles audit logging and security analytics.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.data_classification import DataItem
from app.utils.logger import logger, log_security_event


class AuditService:
    """
    Service for audit logging and security monitoring.
    
    Tracks all security-relevant actions and provides analytics
    for compliance and security monitoring.
    """
    
    def __init__(self, db: Session):
        """
        Initialize audit service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    def log_action(
        self,
        user_id: Optional[int],
        action: str,
        success: bool = True,
        data_id: Optional[int] = None,
        risk_score: Optional[int] = None,
        mfa_required: bool = False,
        mfa_completed: bool = False,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
        request_method: Optional[str] = None,
        status_code: Optional[int] = None,
        failure_reason: Optional[str] = None,
        additional_data: Optional[str] = None,
    ) -> AuditLog:
        """
        Log an action to the audit log.
        
        Args:
            user_id: User who performed the action
            action: Action type (login, classify, encrypt, etc.)
            success: Whether the action succeeded
            data_id: Related data item ID
            risk_score: Calculated risk score
            mfa_required: Whether MFA was required
            mfa_completed: Whether MFA was completed
            ip_address: Client IP address
            user_agent: Client user agent
            request_path: API endpoint path
            request_method: HTTP method
            status_code: HTTP status code
            failure_reason: Reason for failure
            additional_data: Extra context (JSON string)
            
        Returns:
            AuditLog: Created audit log entry
        """
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            data_id=data_id,
            risk_score=risk_score,
            mfa_required=mfa_required,
            mfa_completed=mfa_completed,
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
            status_code=status_code,
            success=success,
            failure_reason=failure_reason,
            additional_data=additional_data,
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        # Log security events
        if not success or audit_log.is_high_risk or audit_log.is_security_event:
            log_security_event(
                event_type=action,
                user_id=user_id,
                details=failure_reason,
                risk_score=risk_score
            )
        
        return audit_log
    
    def get_user_logs(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Get audit logs for a specific user.
        
        Args:
            user_id: User ID
            limit: Maximum number of logs to return
            offset: Offset for pagination
            
        Returns:
            list: Audit log entries
        """
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.user_id == user_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )
    
    def get_recent_logs(
        self,
        limit: int = 100,
        action: Optional[str] = None,
        success_only: Optional[bool] = None
    ) -> List[AuditLog]:
        """
        Get recent audit logs.
        
        Args:
            limit: Maximum number of logs
            action: Filter by action type
            success_only: Filter by success status
            
        Returns:
            list: Recent audit log entries
        """
        query = self.db.query(AuditLog)
        
        if action:
            query = query.filter(AuditLog.action == action)
        
        if success_only is not None:
            query = query.filter(AuditLog.success == success_only)
        
        return (
            query
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .all()
        )
    
    def get_high_risk_logs(
        self,
        threshold: int = 61,
        limit: int = 50
    ) -> List[AuditLog]:
        """
        Get high-risk audit logs.
        
        Args:
            threshold: Minimum risk score to include
            limit: Maximum number of logs
            
        Returns:
            list: High-risk audit log entries
        """
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.risk_score >= threshold)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .all()
        )
    
    def get_failed_logins(
        self,
        user_id: Optional[int] = None,
        hours: int = 24
    ) -> List[AuditLog]:
        """
        Get failed login attempts.
        
        Args:
            user_id: Filter by user ID (None for all users)
            hours: Look back this many hours
            
        Returns:
            list: Failed login audit logs
        """
        since = datetime.utcnow() - timedelta(hours=hours)
        
        query = self.db.query(AuditLog).filter(
            and_(
                AuditLog.action == "login_failed",
                AuditLog.timestamp >= since
            )
        )
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        return query.order_by(AuditLog.timestamp.desc()).all()
    
    def get_statistics(self, days: int = 7) -> Dict[str, Any]:
        """
        Get audit statistics for analytics dashboard.
        
        Args:
            days: Number of days to analyze
            
        Returns:
            dict: Statistics including counts, breakdowns, etc.
        """
        since = datetime.utcnow() - timedelta(days=days)
        
        # Total actions
        total_actions = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.timestamp >= since
        ).scalar()
        
        # Successful vs failed
        successful = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.success == True
            )
        ).scalar()
        
        failed = total_actions - successful
        
        # High risk actions
        high_risk = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.risk_score >= 61
            )
        ).scalar()
        
        # MFA enforced
        mfa_enforced = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.mfa_required == True
            )
        ).scalar()
        
        # Unique users
        unique_users = self.db.query(func.count(func.distinct(AuditLog.user_id))).filter(
            AuditLog.timestamp >= since
        ).scalar()
        
        # Unique IPs
        unique_ips = self.db.query(func.count(func.distinct(AuditLog.ip_address))).filter(
            AuditLog.timestamp >= since
        ).scalar()
        
        # Action breakdown
        login_attempts = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.action.in_(["login", "login_failed"])
            )
        ).scalar()
        
        login_successes = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.action == "login"
            )
        ).scalar()
        
        classifications = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.action == "classify"
            )
        ).scalar()
        
        encryptions = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.action == "encrypt"
            )
        ).scalar()
        
        decryptions = self.db.query(func.count(AuditLog.id)).filter(
            and_(
                AuditLog.timestamp >= since,
                AuditLog.action == "decrypt"
            )
        ).scalar()
        
        return {
            "total_actions": total_actions or 0,
            "successful_actions": successful or 0,
            "failed_actions": failed or 0,
            "high_risk_actions": high_risk or 0,
            "mfa_enforced": mfa_enforced or 0,
            "unique_users": unique_users or 0,
            "unique_ips": unique_ips or 0,
            "login_attempts": login_attempts or 0,
            "login_successes": login_successes or 0,
            "login_failures": login_attempts - login_successes if login_attempts else 0,
            "classifications": classifications or 0,
            "encryptions": encryptions or 0,
            "decryptions": decryptions or 0,
        }
    
    def get_security_alerts(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get recent security alerts (failed logins, high-risk actions, etc.).
        
        Args:
            limit: Maximum number of alerts
            
        Returns:
            list: Security alert summaries
        """
        # Get failed logins and high-risk actions from last 24 hours
        since = datetime.utcnow() - timedelta(hours=24)
        
        alerts_query = self.db.query(AuditLog).filter(
            and_(
                AuditLog.timestamp >= since,
                (
                    (AuditLog.success == False) |
                    (AuditLog.risk_score >= 61)
                )
            )
        ).order_by(AuditLog.timestamp.desc()).limit(limit)
        
        alerts = []
        for log in alerts_query:
            alert = {
                "alert_type": "failed_action" if not log.success else "high_risk",
                "severity": "critical" if log.risk_score and log.risk_score >= 80 else "high",
                "message": self._format_alert_message(log),
                "user_id": log.user_id,
                "ip_address": log.ip_address,
                "timestamp": log.timestamp,
                "risk_score": log.risk_score,
                "action": log.action,
            }
            alerts.append(alert)
        
        return alerts
    
    def _format_alert_message(self, log: AuditLog) -> str:
        """Format an alert message from audit log."""
        if not log.success:
            return f"Failed {log.action} attempt from {log.ip_address or 'unknown IP'}"
        elif log.risk_score and log.risk_score >= 61:
            return f"High-risk {log.action} (score: {log.risk_score}) from {log.ip_address or 'unknown IP'}"
        else:
            return f"Security event: {log.action}"
