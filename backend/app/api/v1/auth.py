"""
Authentication API Endpoints

Handles user registration, login, token refresh, and user management.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    UserUpdate,
)
from app.core.security import (
    hash_password,
    verify_password,
    calculate_risk_score,
    requires_mfa,
)
from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)
from app.api.deps import (
    get_current_user,
    get_client_ip,
    get_user_agent,
    require_admin,
)
from app.services.audit_service import AuditService
from app.utils.logger import logger
from app.config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Register a new user.
    
    - Creates a new user account with hashed password
    - Logs the registration event
    - Returns user details (without password)
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role or UserRole.USER,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log registration
    audit_service = AuditService(db)
    audit_service.log_action(
        user_id=new_user.id,
        action="register",
        success=True,
        ip_address=get_client_ip(request) if request else None,
        user_agent=get_user_agent(request) if request else None,
        status_code=status.HTTP_201_CREATED,
    )
    
    logger.info(f"New user registered: {new_user.username} (ID: {new_user.id})")
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Login and receive JWT tokens.
    
    - Validates credentials
    - Calculates risk score
    - Checks MFA requirements
    - Returns access and refresh tokens
    """
    # Get user
    user = db.query(User).filter(User.username == credentials.username).first()
    
    ip_address = get_client_ip(request) if request else None
    user_agent = get_user_agent(request) if request else None
    audit_service = AuditService(db)
    
    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.password_hash):
        # Log failed login
        audit_service.log_action(
            user_id=user.id if user else None,
            action="login_failed",
            success=False,
            failure_reason="Invalid credentials",
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        
        # Update failed login counter
        if user:
            user.failed_login_attempts += 1
            user.last_failed_login = datetime.utcnow()
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Calculate risk score
    risk_score = calculate_risk_score(
        user_role=user.role,
        failed_attempts=user.failed_login_attempts,
        request_time=datetime.utcnow(),
    )
    
    mfa_required = requires_mfa(risk_score)
    
    # TODO: Implement actual MFA challenge if required
    # For now, just log the requirement
    if mfa_required:
        logger.warning(f"MFA required for user {user.username} (risk: {risk_score})")
    
    # Create tokens
    access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        role=user.role
    )
    
    refresh_token = create_refresh_token(
        user_id=user.id,
        username=user.username
    )
    
    # Update user login info
    user.last_login = datetime.utcnow()
    user.failed_login_attempts = 0  # Reset on successful login
    db.commit()
    
    # Log successful login
    audit_service.log_action(
        user_id=user.id,
        action="login",
        success=True,
        risk_score=risk_score,
        mfa_required=mfa_required,
        mfa_completed=not mfa_required,  # Would be True after MFA verification
        ip_address=ip_address,
        user_agent=user_agent,
        status_code=status.HTTP_200_OK,
    )
    
    logger.info(f"User logged in: {user.username} (risk: {risk_score})")
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    - Validates refresh token
    - Issues new access and refresh tokens
    """
    # Decode and verify refresh token
    try:
        payload = decode_token(refresh_token)
        verify_token_type(payload, "refresh")
    except HTTPException:
        raise
    
    user_id = payload.get("user_id")
    username = payload.get("username")
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Create new tokens
    new_access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        role=user.role
    )
    
    new_refresh_token = create_refresh_token(
        user_id=user.id,
        username=user.username
    )
    
    logger.info(f"Token refreshed for user: {username}")
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user's information.
    """
    return current_user


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only).
    
    - Requires admin role
    - Supports pagination
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user information (admin only).
    
    - Requires admin role
    - Can update role, active status, MFA settings
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.mfa_enabled is not None:
        user.mfa_enabled = user_update.mfa_enabled
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"User {user.username} updated by admin {current_user.username}")
    
    return user
