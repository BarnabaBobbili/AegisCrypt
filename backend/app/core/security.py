"""
Security Utilities

Password hashing, verification, and risk scoring for adaptive security.
"""

import bcrypt
from datetime import datetime, time
from typing import Optional

from app.config import settings
from app.models.user import UserRole


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Bcrypt automatically handles salt generation and is resistant
    to rainbow table attacks.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password (includes salt)
    """
    # Generate salt and hash password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        bool: True if password matches
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def calculate_risk_score(
    user_role: UserRole,
    sensitivity_level: Optional[str] = None,
    ip_address: Optional[str] = None,
    is_new_ip: bool = False,
    failed_attempts: int = 0,
    request_time: Optional[datetime] = None,
    access_frequency: int = 0
) -> int:
    """
    Calculate risk score for adaptive authentication.
    
    Risk score ranges from 0-100:
    - 0-30: Low risk (no MFA)
    - 31-60: Medium risk (MFA recommended)
    - 61-100: High risk (MFA required)
    
    Args:
        user_role: User's role
        sensitivity_level: Data sensitivity being accessed
        ip_address: Client IP address
        is_new_ip: Whether this is a new IP for the user
        failed_attempts: Recent failed authentication attempts
        request_time: Time of the request
        access_frequency: Number of requests in last minute
        
    Returns:
        int: Risk score (0-100)
    """
    score = 0
    
    # Base score by role
    role_scores = {
        UserRole.ADMIN: 10,
        UserRole.MANAGER: 20,
        UserRole.USER: 30,
        UserRole.GUEST: 50,
    }
    score += role_scores.get(user_role, 30)
    
    # Data sensitivity
    if sensitivity_level:
        sensitivity_scores = {
            "public": 0,
            "internal": 0,
            "confidential": 20,
            "highly_sensitive": 40,
        }
        score += sensitivity_scores.get(sensitivity_level.lower(), 0)
    
    # New IP address
    if is_new_ip:
        score += 15
    
    # Failed authentication attempts
    score += min(failed_attempts * 10, 30)  # Cap at 30
    
    # Off-hours access (outside 9 AM - 6 PM)
    if request_time:
        business_start = time(settings.BUSINESS_START_HOUR, 0)
        business_end = time(settings.BUSINESS_END_HOUR, 0)
        current_time = request_time.time()
        
        if not (business_start <= current_time <= business_end):
            score += 15
        
        # Weekend access
        if request_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
            score += 10
    
    # Excessive access frequency (> 10 requests/minute)
    if access_frequency > 10:
        score += 20
    
    # Cap at 100
    return min(score, 100)


def requires_mfa(risk_score: int) -> bool:
    """
    Determine if MFA is required based on risk score.
    
    Args:
        risk_score: Calculated risk score (0-100)
        
    Returns:
        bool: True if MFA is mandatory
    """
    return risk_score >= settings.MFA_REQUIRED_RISK_SCORE


def mfa_recommended(risk_score: int) -> bool:
    """
    Determine if MFA is recommended based on risk score.
    
    Args:
        risk_score: Calculated risk score (0-100)
        
    Returns:
        bool: True if MFA is recommended (but not mandatory)
    """
    return (
        settings.MFA_RECOMMENDED_RISK_SCORE
        <= risk_score
        < settings.MFA_REQUIRED_RISK_SCORE
    )


def get_risk_level(risk_score: int) -> str:
    """
    Get risk level description from score.
    
    Args:
        risk_score: Risk score (0-100)
        
    Returns:
        str: Risk level ("low", "medium", or "high")
    """
    if risk_score <= settings.RISK_LOW_THRESHOLD:
        return "low"
    elif risk_score <= settings.RISK_MEDIUM_THRESHOLD:
        return "medium"
    else:
        return "high"
