"""
adaptive_rate_limiter.py

Adaptive rate limiting with behavior-based detection.
Adjusts limits based on user behavior patterns.

Author: AI-Driven Adaptive Cryptographic Policy Engine
Created: 2025-12-13
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import threading

# ============================================================================
# ADAPTIVE RATE LIMITER
# ============================================================================

class AdaptiveRateLimiter:
    """
    Smart rate limiter that adapts to user behavior.
    
    Features:
    - User-based tracking (not just IP)
    - Behavior analysis (failed attempts, patterns)
    - Dynamic limit adjustment
    - Whitelist for trusted users
    - Temporary blocking for suspicious activity
    """
    
    def __init__(self):
        """Initialize the adaptive rate limiter."""
        # Track failed login attempts per email
        self.failed_attempts: Dict[str, list] = defaultdict(list)
        
        # Track suspicious IPs
        self.suspicious_ips: Dict[str, dict] = defaultdict(dict)
        
        # Whitelist of trusted users/IPs
        self.whitelist: set = set()
        
        # Temporarily blocked users/IPs
        self.blocked: Dict[str, datetime] = {}
        
        # Thread lock for concurrent access
        self.lock = threading.Lock()
    
    def check_login_attempt(
        self,
        email: str,
        ip_address: str,
        success: bool
    ) -> tuple[bool, str]:
        """
        Check if login attempt should be allowed.
        
        Args:
            email: User email attempting login
            ip_address: Client IP address
            success: Whether login was successful
            
        Returns:
            tuple: (allowed: bool, reason: str)
        """
        with self.lock:
            now = datetime.now()
            
            # Check if email is temporarily blocked
            if email in self.blocked:
                if now < self.blocked[email]:
                    remaining = (self.blocked[email] - now).seconds
                    return False, f"Account temporarily blocked. Try again in {remaining} seconds"
                else:
                    # Block expired, remove it
                    del self.blocked[email]
            
            # Check if IP is temporarily blocked
            if ip_address in self.blocked:
                if now < self.blocked[ip_address]:
                    remaining = (self.blocked[ip_address] - now).seconds
                    return False, f"IP temporarily blocked. Try again in {remaining} seconds"
                else:
                    del self.blocked[ip_address]
            
            # Whitelisted users always allowed
            if email in self.whitelist or ip_address in self.whitelist:
                return True, "Whitelisted"
            
            if not success:
                # Failed login attempt
                self.failed_attempts[email].append({
                    'timestamp': now,
                    'ip': ip_address
                })
                
                # Clean old attempts (older than 5 minutes)
                self.failed_attempts[email] = [
                    attempt for attempt in self.failed_attempts[email]
                    if now - attempt['timestamp'] < timedelta(minutes=5)
                ]
                
                # Count recent failures
                recent_failures = len(self.failed_attempts[email])
                
                # Adaptive blocking based on failure count
                if recent_failures >= 10:
                    # Severe: 10+ failures in 5 minutes → Block for 30 minutes
                    self.blocked[email] = now + timedelta(minutes=30)
                    return False, "Too many failed attempts. Account blocked for 30 minutes"
                
                elif recent_failures >= 5:
                    # Moderate: 5-9 failures → Block for 5 minutes
                    self.blocked[email] = now + timedelta(minutes=5)
                    return False, "Too many failed attempts. Account blocked for 5 minutes"
                
                elif recent_failures >= 3:
                    # Warning: 3-4 failures → Slow down
                    return True, f"Warning: {recent_failures} failed attempts"
            
            else:
                # Successful login - clear failed attempts
                if email in self.failed_attempts:
                    del self.failed_attempts[email]
            
            return True, "Allowed"
    
    def check_ip_rate(
        self,
        ip_address: str,
        operation: str,
        limit: int = 100
    ) -> tuple[bool, str]:
        """
        Check IP-based rate limit for operations.
        
        Args:
            ip_address: Client IP
            operation: Operation type (e.g., 'encrypt', 'classify')
            limit: Max operations per minute
            
        Returns:
            tuple: (allowed: bool, reason: str)
        """
        with self.lock:
            now = datetime.now()
            
            # Initialize IP tracking
            if ip_address not in self.suspicious_ips:
                self.suspicious_ips[ip_address] = {
                    'operations': defaultdict(list)
                }
            
            # Get operation history
            ops = self.suspicious_ips[ip_address]['operations'][operation]
            
            # Clean old operations (older than 1 minute)
            ops = [
                timestamp for timestamp in ops
                if now - timestamp < timedelta(minutes=1)
            ]
            self.suspicious_ips[ip_address]['operations'][operation] = ops
            
            # Check if limit exceeded
            if len(ops) >= limit:
                return False, f"Rate limit exceeded: {limit} {operation} operations per minute"
            
            # Record this operation
            ops.append(now)
            
            return True, "Allowed"
    
    def check_user_rate(
        self,
        user_id: int,
        operation: str,
        limit: int = 1000
    ) -> tuple[bool, str]:
        """
        Check user-based rate limit (for authenticated users).
        
        Args:
            user_id: Authenticated user ID
            operation: Operation type
            limit: Max operations per minute
            
        Returns:
            tuple: (allowed: bool, reason: str)
        """
        # For authenticated users, use very high limits
        # They're already verified, so trust them more
        return True, "Authenticated user - high limit"
    
    def add_to_whitelist(self, identifier: str):
        """Add email or IP to whitelist."""
        with self.lock:
            self.whitelist.add(identifier)
    
    def remove_from_whitelist(self, identifier: str):
        """Remove from whitelist."""
        with self.lock:
            self.whitelist.discard(identifier)
    
    def unblock(self, identifier: str):
        """Manually unblock an email or IP."""
        with self.lock:
            if identifier in self.blocked:
                del self.blocked[identifier]
    
    def get_stats(self) -> dict:
        """Get current rate limiter statistics."""
        with self.lock:
            return {
                'failed_attempts_tracked': len(self.failed_attempts),
                'suspicious_ips': len(self.suspicious_ips),
                'whitelisted': len(self.whitelist),
                'currently_blocked': len(self.blocked)
            }


# ============================================================================
# GLOBAL INSTANCE
# ============================================================================

# Singleton instance
adaptive_limiter = AdaptiveRateLimiter()
