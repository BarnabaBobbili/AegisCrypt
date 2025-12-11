from __future__ import annotations
"""
Audit Log Model

Comprehensive logging of all security-relevant actions in the system.
Tracks user activities, risk scores, MFA enforcement, and access patterns.
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class AuditLog(Base):
    """
    Audit log model for comprehensive security logging.
    
    Logs all security-relevant activities including:
    - Authentication attempts (success/failure)
    - Data classification operations
    - Encryption/decryption operations
    - Access control decisions
    - Policy changes
    - User management actions
    
    Attributes:
        id: Primary key
        user_id: Foreign key to user performing the action
        action: Action type (login, classify, encrypt, decrypt, etc.)
        data_id: Foreign key to related data item (if applicable)
        risk_score: Calculated risk score for this action
        mfa_required: Whether MFA was required
        mfa_completed: Whether MFA was successfully completed
        ip_address: Client IP address
        user_agent: Client user agent string
        request_path: API endpoint path
        request_method: HTTP method (GET, POST, etc.)
        status_code: HTTP response status code
        success: Whether the action was successful
        failure_reason: Reason for failure (if applicable)
        additional_data: JSON field for extra context
        timestamp: When the action occurred
        
    Relationships:
        user: User who performed the action
        data_item: Data item related to this action (if any)
    """
    
    __tablename__ = "audit_logs"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Keys
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="User who performed the action"
    )
    data_id = Column(
        Integer,
        ForeignKey("data_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Related data item ID"
    )
    
    # Action Details
    action = Column(
        String(50),
        nullable=False,
        index=True,
        comment="Action type (login, classify, encrypt, etc.)"
    )
    
    # Security Context
    risk_score = Column(
        Integer,
        nullable=True,
        index=True,
        comment="Calculated risk score (0-100)"
    )
    mfa_required = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether MFA was required"
    )
    mfa_completed = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether MFA was completed"
    )
    
    # Request Context
    ip_address = Column(
        String(45),
        nullable=True,
        index=True,
        comment="Client IP address (supports IPv6)"
    )
    user_agent = Column(
        Text,
        nullable=True,
        comment="Client user agent string"
    )
    request_path = Column(
        String(255),
        nullable=True,
        comment="API endpoint path"
    )
    request_method = Column(
        String(10),
        nullable=True,
        comment="HTTP method"
    )
    status_code = Column(
        Integer,
        nullable=True,
        comment="HTTP response status code"
    )
    
    # Result
    success = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        comment="Whether the action succeeded"
    )
    failure_reason = Column(
        Text,
        nullable=True,
        comment="Reason for failure"
    )
    
    # Additional Context
    additional_data = Column(
        Text,
        nullable=True,
        comment="JSON-encoded additional context"
    )
    
    # Timestamp
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="When the action occurred"
    )
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    data_item = relationship("DataItem", back_populates="audit_logs")
    
    def __repr__(self) -> str:
        return (
            f"<AuditLog(id={self.id}, "
            f"action='{self.action}', "
            f"user_id={self.user_id}, "
            f"success={self.success})>"
        )
    
    @property
    def is_high_risk(self) -> bool:
        """Check if this action was high risk."""
        return self.risk_score is not None and self.risk_score >= 61
    
    @property
    def is_security_event(self) -> bool:
        """Check if this is a security-relevant event."""
        security_actions = [
            "login",
            "login_failed",
            "logout",
            "mfa_required",
            "mfa_failed",
            "access_denied",
            "policy_changed",
            "user_created",
            "user_deleted",
            "role_changed",
        ]
        return self.action in security_actions or not self.success

