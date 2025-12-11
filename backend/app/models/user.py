from __future__ import annotations
"""
User Model

Defines the User database model for authentication and authorization.
Includes role-based access control (RBAC) with four-tier role system.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """
    User role enumeration for RBAC.
    
    Roles are hierarchical with different access levels:
    - ADMIN: Full system access, user management, policy configuration
    - MANAGER: Access to Public/Internal/Confidential data, team oversight
    - USER: Public and Internal data access only
    - GUEST: Read-only public data access
    """
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    GUEST = "guest"


class User(Base):
    """
    User model for authentication and authorization.
    
    Attributes:
        id: Primary key
        username: Unique username for login
        email: Unique email address
        password_hash: Bcrypt hashed password (never store plaintext!)
        role: User role for RBAC (admin, manager, user, guest)
        is_active: Whether the user account is active
        mfa_enabled: Whether MFA is enabled for this user
        mfa_secret: TOTP secret for MFA (encrypted)
        created_at: Account creation timestamp
        last_login: Last successful login timestamp
        failed_login_attempts: Counter for rate limiting
        last_failed_login: Timestamp of last failed login attempt
        
    Relationships:
        data_items: Data items created by this user
        audit_logs: Audit log entries for this user's actions
    """
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Authentication Credentials
    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique username for login"
    )
    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique email address"
    )
    password_hash = Column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password"
    )
    
    # Authorization
    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.USER,
        comment="User role for RBAC"
    )
    
    # Account Status
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether the account is active"
    )
    
    # Multi-Factor Authentication
    mfa_enabled = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether MFA is enabled"
    )
    mfa_secret = Column(
        String(255),
        nullable=True,
        comment="TOTP secret for MFA (encrypted)"
    )
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Account creation timestamp"
    )
    last_login = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last successful login timestamp"
    )
    
    # Security - Rate Limiting
    failed_login_attempts = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Failed login attempt counter"
    )
    last_failed_login = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp of last failed login"
    )
    
    # Relationships
    data_items = relationship(
        "DataItem",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.value}')>"
    
    def has_permission(self, required_role: UserRole) -> bool:
        """
        Check if user has permission for a required role.
        
        Role hierarchy:
        - ADMIN > MANAGER > USER > GUEST
        
        Args:
            required_role: Minimum required role
            
        Returns:
            bool: True if user has sufficient permissions
        """
        role_hierarchy = {
            UserRole.GUEST: 1,
            UserRole.USER: 2,
            UserRole.MANAGER: 3,
            UserRole.ADMIN: 4,
        }
        
        return role_hierarchy.get(self.role, 0) >= role_hierarchy.get(required_role, 0)
    
    def can_access_sensitivity(self, sensitivity_level: str) -> bool:
        """
        Check if user can access data with given sensitivity level.
        
        Access matrix:
        - ADMIN: All levels
        - MANAGER: Public, Internal, Confidential
        - USER: Public, Internal
        - GUEST: Public only
        
        Args:
            sensitivity_level: Data sensitivity level
            
        Returns:
            bool: True if user can access this sensitivity level
        """
        access_matrix = {
            UserRole.ADMIN: ["public", "internal", "confidential", "highly_sensitive"],
            UserRole.MANAGER: ["public", "internal", "confidential"],
            UserRole.USER: ["public", "internal"],
            UserRole.GUEST: ["public"],
        }
        
        allowed_levels = access_matrix.get(self.role, [])
        return sensitivity_level.lower() in allowed_levels

