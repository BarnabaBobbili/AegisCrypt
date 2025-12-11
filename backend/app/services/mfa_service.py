"""
MFA Service

Handles TOTP-based multi-factor authentication including:
- Secret generation
- QR code generation for authenticator apps
- TOTP code verification
- Backup code management
"""

import pyotp
import qrcode
import io
import base64
import secrets
from typing import Tuple, List


class MFAService:
    """Service for managing TOTP-based MFA."""
    
    @staticmethod
    def generate_secret() -> str:
        """
        Generate a random TOTP secret.
        
        Returns:
            str: Base32-encoded secret key (compatible with Google Authenticator)
        """
        return pyotp.random_base32()
    
    @staticmethod
    def generate_totp_uri(secret: str, username: str, issuer: str = "Adaptive Crypto Engine") -> str:
        """
        Generate a TOTP URI for QR code generation.
        
        Args:
            secret: TOTP secret key
            username: User's username or email
            issuer: Application name
            
        Returns:
            str: otpauth:// URI
        """
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=username, issuer_name=issuer)
    
    @staticmethod
    def generate_qr_code(secret: str, username: str) -> str:
        """
        Generate a QR code image for TOTP setup.
        
        Args:
            secret: TOTP secret key
            username: User's username
            
        Returns:
            str: Base64-encoded PNG image
        """
        # Generate TOTP URI
        uri = MFAService.generate_totp_uri(secret, username)
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{img_base64}"
    
    @staticmethod
    def verify_totp(secret: str, code: str) -> bool:
        """
        Verify a TOTP code.
        
        Args:
            secret: TOTP secret key
            code: 6-digit code from authenticator app
            
        Returns:
            bool: True if code is valid
        """
        totp = pyotp.TOTP(secret)
        # Allow for 30-second time window flexibility
        return totp.verify(code, valid_window=1)
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """
        Generate backup codes for recovery.
        
        Args:
            count: Number of backup codes to generate
            
        Returns:
            list: List of backup codes (8 characters each)
        """
        codes = []
        for _ in range(count):
            # Generate 8-character alphanumeric code
            code = secrets.token_hex(4).upper()  # 8 hex chars
            codes.append(code)
        return codes
    
    @staticmethod
    def verify_backup_code(backup_codes: List[str], code: str) -> Tuple[bool, List[str]]:
        """
        Verify a backup code and remove it from the list.
        
        Args:
            backup_codes: List of remaining backup codes
            code: Code to verify
            
        Returns:
            tuple: (is_valid, updated_backup_codes)
        """
        code_upper = code.upper().replace("-", "").replace(" ", "")
        
        if code_upper in backup_codes:
            # Remove used code
            updated_codes = [c for c in backup_codes if c != code_upper]
            return True, updated_codes
        
        return False, backup_codes
