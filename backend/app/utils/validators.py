"""
Validation Utilities

Custom validators for data validation across the application.
"""

import re
from typing import Optional
from ipaddress import ip_address, AddressValueError


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
        
    Returns:
        bool: True if valid
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_username(username: str) -> bool:
    """
    Validate username format.
    
    Requirements:
    - 3-50 characters
    - Only letters, numbers, underscores, and hyphens
    
    Args:
        username: Username to validate
        
    Returns:
        bool: True if valid
    """
    if not (3 <= len(username) <= 50):
        return False
    
    pattern = r'^[a-zA-Z0-9_-]+$'
    return bool(re.match(pattern, username))


def validate_ip_address(ip: str) -> bool:
    """
    Validate IP address (IPv4 or IPv6).
    
    Args:
        ip: IP address string
        
    Returns:
        bool: True if valid
    """
    try:
        ip_address(ip)
        return True
    except (AddressValueError, ValueError):
        return False


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename by removing dangerous characters.
    
    Args:
        filename: Original filename
        
    Returns:
        str: Sanitized filename
    """
    # Remove path separators and dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', filename)
    
    # Remove leading/trailing dots and spaces
    sanitized = sanitized.strip('. ')
    
    # Limit length
    if len(sanitized) > 255:
        sanitized = sanitized[:255]
    
    return sanitized


def validate_sensitivity_level(level: str) -> bool:
    """
    Validate sensitivity level value.
    
    Args:
        level: Sensitivity level string
        
    Returns:
        bool: True if valid
    """
    valid_levels = ["public", "internal", "confidential", "highly_sensitive"]
    return level.lower() in valid_levels


def is_safe_text(text: str, max_length: int = 10000) -> bool:
    """
    Check if text is safe (no malicious content, reasonable length).
    
    Args:
        text: Text to validate
        max_length: Maximum allowed length
        
    Returns:
        bool: True if safe
    """
    if len(text) > max_length:
        return False
    
    # Check for null bytes (potential injection)
    if '\x00' in text:
        return False
    
    return True


def sanitize_sql_like_pattern(pattern: str) -> str:
    """
    Sanitize a SQL LIKE pattern by escaping special characters.
    
    Args:
        pattern: Original pattern
        
    Returns:
        str: Escaped pattern
    """
    # Escape special LIKE characters
    sanitized = pattern.replace('\\', '\\\\')
    sanitized = sanitized.replace('%', '\\%')
    sanitized = sanitized.replace('_', '\\_')
    
    return sanitized
