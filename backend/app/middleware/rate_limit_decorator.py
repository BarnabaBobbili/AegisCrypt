"""
rate_limit_decorator.py

Decorators for applying adaptive rate limiting to endpoints.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

from functools import wraps
from fastapi import Request, HTTPException, status
from app.middleware.adaptive_rate_limiter import adaptive_limiter

# ============================================================================
# DECORATORS
# ============================================================================

def adaptive_login_limit():
    """
    Adaptive rate limiting for login endpoints.
    
    Tracks failed attempts per email and blocks suspicious activity.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request and credentials
            request: Request = kwargs.get('request') or args[0]
            user_data = kwargs.get('user_data') or args[1]
            
            # Get client IP
            client_ip = request.client.host
            email = user_data.email
            
            # Check if attempt is allowed (before trying login)
            allowed, reason = adaptive_limiter.check_login_attempt(
                email=email,
                ip_address=client_ip,
                success=False  # We don't know yet
            )
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=reason
                )
            
            # Execute the login function
            try:
                result = await func(*args, **kwargs)
                
                # Login successful - clear failed attempts
                adaptive_limiter.check_login_attempt(
                    email=email,
                    ip_address=client_ip,
                    success=True
                )
                
                return result
                
            except HTTPException as e:
                # Login failed - record it
                if e.status_code == 401:  # Unauthorized
                    adaptive_limiter.check_login_attempt(
                        email=email,
                        ip_address=client_ip,
                        success=False
                    )
                raise
        
        return wrapper
    return decorator


def adaptive_ip_limit(operation: str, limit: int = 100):
    """
    IP-based rate limiting for anonymous operations.
    
    Args:
        operation: Operation name (e.g., 'encrypt', 'classify')
        limit: Max operations per minute per IP
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request
            request: Request = kwargs.get('request') or args[0]
            client_ip = request.client.host
            
            # Check rate limit
            allowed, reason = adaptive_limiter.check_ip_rate(
                ip_address=client_ip,
                operation=operation,
                limit=limit
            )
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=reason
                )
            
            # Execute function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def adaptive_user_limit(operation: str, limit: int = 1000):
    """
    User-based rate limiting for authenticated operations.
    
    Args:
        operation: Operation name
        limit: Max operations per minute per user
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user
            current_user = kwargs.get('current_user')
            
            if current_user:
                # Check user rate limit
                allowed, reason = adaptive_limiter.check_user_rate(
                    user_id=current_user.id,
                    operation=operation,
                    limit=limit
                )
                
                if not allowed:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=reason
                    )
            
            # Execute function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator
