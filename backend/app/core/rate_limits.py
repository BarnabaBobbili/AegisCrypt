"""
rate_limits.py

Rate limit configurations for different API endpoints.
Prevents brute force attacks and API abuse.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

# ============================================================================
# RATE LIMIT CONFIGURATIONS
# ============================================================================

# Authentication endpoints - strict limits to prevent brute force
AUTH_LIMITS = {
    "login": "5/minute",           # 5 login attempts per minute
    "register": "3/minute",        # 3 registrations per minute
    "refresh": "10/minute",        # 10 token refreshes per minute
    "mfa_verify": "5/minute",      # 5 MFA verification attempts per minute
}

# Public endpoints - moderate limits
PUBLIC_LIMITS = {
    "encrypt": "10/minute",        # 10 encryptions per minute
    "decrypt": "10/minute",        # 10 decryptions per minute
    "classify": "20/minute",       # 20 classifications per minute
}

# Protected endpoints - higher limits for authenticated users
PROTECTED_LIMITS = {
    "encryption": "30/minute",     # 30 encryption operations per minute
    "classification": "30/minute", # 30 classification operations per minute
    "policies": "50/minute",       # 50 policy queries per minute
}

# Admin endpoints - highest limits
ADMIN_LIMITS = {
    "users": "50/minute",          # 50 user management operations per minute
    "analytics": "100/minute",     # 100 analytics queries per minute
}

# Benchmark endpoints - lower limits (resource intensive)
BENCHMARK_LIMITS = {
    "run": "2/hour",               # 2 benchmark runs per hour
    "results": "30/minute",        # 30 result queries per minute
}

# Default limit for unspecified endpoints
DEFAULT_LIMIT = "60/minute"        # 60 requests per minute

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_limit_for_endpoint(endpoint: str) -> str:
    """
    Get rate limit for a specific endpoint.
    
    Args:
        endpoint: API endpoint path
        
    Returns:
        str: Rate limit string (e.g., "5/minute")
    """
    # Check authentication endpoints
    if "/auth/login" in endpoint:
        return AUTH_LIMITS["login"]
    elif "/auth/register" in endpoint:
        return AUTH_LIMITS["register"]
    elif "/auth/refresh" in endpoint:
        return AUTH_LIMITS["refresh"]
    elif "/auth/mfa" in endpoint:
        return AUTH_LIMITS["mfa_verify"]
    
    # Check public endpoints
    elif "/public/encrypt" in endpoint:
        return PUBLIC_LIMITS["encrypt"]
    elif "/public/decrypt" in endpoint or "/share/" in endpoint:
        return PUBLIC_LIMITS["decrypt"]
    elif "/public/classify" in endpoint:
        return PUBLIC_LIMITS["classify"]
    
    # Check benchmark endpoints
    elif "/benchmarks/run" in endpoint:
        return BENCHMARK_LIMITS["run"]
    elif "/benchmarks/" in endpoint:
        return BENCHMARK_LIMITS["results"]
    
    # Check admin endpoints
    elif "/admin/" in endpoint:
        return ADMIN_LIMITS["users"]
    
    # Check protected endpoints
    elif "/encryption/" in endpoint:
        return PROTECTED_LIMITS["encryption"]
    elif "/classification/" in endpoint:
        return PROTECTED_LIMITS["classification"]
    elif "/policies" in endpoint:
        return PROTECTED_LIMITS["policies"]
    elif "/analytics/" in endpoint:
        return ADMIN_LIMITS["analytics"]
    
    # Default limit
    return DEFAULT_LIMIT
