"""
Core Package

This package contains core security, authentication, and cryptographic utilities.
"""

from app.core.crypto import (
    generate_aes_key,
    aes_encrypt,
    aes_decrypt,
    generate_rsa_keypair,
    rsa_encrypt,
    rsa_decrypt,
    sha256_hash,
    sha512_hash,
    verify_hash,
    sign_data,
    verify_signature,
    hybrid_encrypt,
    hybrid_decrypt,
)

from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)

from app.core.security import (
    hash_password,
    verify_password,
    calculate_risk_score,
    requires_mfa,
    mfa_recommended,
    get_risk_level,
)

__all__ = [
    # Crypto
    "generate_aes_key",
    "aes_encrypt",
    "aes_decrypt",
    "generate_rsa_keypair",
    "rsa_encrypt",
    "rsa_decrypt",
    "sha256_hash",
    "sha512_hash",
    "verify_hash",
    "sign_data",
    "verify_signature",
    "hybrid_encrypt",
    "hybrid_decrypt",
    # JWT
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "verify_token_type",
    # Security
    "hash_password",
    "verify_password",
    "calculate_risk_score",
    "requires_mfa",
    "mfa_recommended",
    "get_risk_level",
]
