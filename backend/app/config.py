"""
Application Configuration Module

This module manages all configuration settings for the application,
including database connection, JWT settings, cryptographic parameters,
and security configurations.
"""

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All sensitive information should be stored in .env file
    and never committed to version control.
    """
    
    # Application Settings
    APP_NAME: str = "Adaptive Crypto Policy Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database Settings
    DATABASE_URL: str = Field(
        default="sqlite:///./adaptive_crypto.db",
        description="SQLite database connection string"
    )
    
    # JWT Settings
    SECRET_KEY: str = Field(
        default="your-secret-key-change-this-in-production",
        description="Secret key for JWT token generation"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days
    
    # Security Settings
    BCRYPT_ROUNDS: int = Field(
        default=12,
        description="Cost factor for bcrypt hashing (higher = more secure but slower)"
    )
    
    # Password Requirements
    MIN_PASSWORD_LENGTH: int = 8
    REQUIRE_UPPERCASE: bool = True
    REQUIRE_LOWERCASE: bool = True
    REQUIRE_DIGITS: bool = True
    REQUIRE_SPECIAL_CHARS: bool = True
    
    # Rate Limiting
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_ATTEMPT_WINDOW_MINUTES: int = 15
    
    # Risk Scoring Thresholds
    RISK_LOW_THRESHOLD: int = 30
    RISK_MEDIUM_THRESHOLD: int = 60
    RISK_HIGH_THRESHOLD: int = 61
    
    # MFA Settings
    MFA_REQUIRED_RISK_SCORE: int = 61
    MFA_RECOMMENDED_RISK_SCORE: int = 31
    
    # Cryptographic Settings
    AES_KEY_SIZE: int = 256  # bits
    RSA_KEY_SIZE: int = 2048  # bits
    DEFAULT_HASH_ALGORITHM: str = "SHA-256"
    
    # ML Model Settings
    ML_MODEL_PATH: str = "./ml_models/distilbert"
    ML_CONFIDENCE_THRESHOLD: float = 0.85
    
    # CORS Settings
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        description="Comma-separated list of allowed CORS origins"
    )
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # Business Hours (for risk calculation)
    BUSINESS_START_HOUR: int = 9  # 9 AM
    BUSINESS_END_HOUR: int = 18  # 6 PM
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }



# Global settings instance
settings = Settings()
