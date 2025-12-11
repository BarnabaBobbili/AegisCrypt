"""
Logging Utility

Configures and provides logging functionality for the application.
Logs to both console and file with rotation.
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Optional

from app.config import settings


def setup_logger(name: str = __name__) -> logging.Logger:
    """
    Set up and configure a logger.
    
    Creates both console and file handlers with appropriate formatting.
    File logs are rotated when they reach 10MB.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        logging.Logger: Configured logger
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(funcName)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    simple_formatter = logging.Formatter(
        "[%(levelname)s] %(message)s"
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler
    try:
        # Ensure log directory exists
        log_file = Path(settings.LOG_FILE)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Rotating file handler (10MB per file, keep 5 backups)
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        logger.warning(f"Could not set up file logging: {e}")
    
    return logger


# Global logger instance
logger = setup_logger("app")


def log_request(
    method: str,
    path: str,
    user_id: Optional[int] = None,
    status_code: Optional[int] = None,
    duration_ms: Optional[float] = None
) -> None:
    """
    Log an API request.
    
    Args:
        method: HTTP method
        path: Request path
        user_id: Authenticated user ID (if any)
        status_code: Response status code
        duration_ms: Request duration in milliseconds
    """
    user_info = f"user_id={user_id}" if user_id else "anonymous"
    duration_info = f"{duration_ms:.2f}ms" if duration_ms else ""
    
    logger.info(
        f"{method} {path} - {user_info} - Status:{status_code} - {duration_info}"
    )


def log_security_event(
    event_type: str,
    user_id: Optional[int] = None,
    details: Optional[str] = None,
    risk_score: Optional[int] = None
) -> None:
    """
    Log a security-relevant event.
    
    Args:
        event_type: Type of security event
        user_id: User ID involved (if any)
        details: Additional details
        risk_score: Risk score if calculated
    """
    user_info = f"user_id={user_id}" if user_id else "anonymous"
    risk_info = f"risk={risk_score}" if risk_score is not None else ""
    details_info = f"- {details}" if details else ""
    
    logger.warning(
        f"SECURITY [{event_type}] {user_info} {risk_info} {details_info}"
    )


def log_error(
    error: Exception,
    context: Optional[str] = None,
    user_id: Optional[int] = None
) -> None:
    """
    Log an error with context.
    
    Args:
        error: Exception that occurred
        context: Additional context about where/why it happened
        user_id: User ID if relevant
    """
    user_info = f"user_id={user_id}" if user_id else ""
    context_info = f"[{context}]" if context else ""
    
    logger.error(
        f"ERROR {context_info} {user_info}: {type(error).__name__}: {str(error)}",
        exc_info=True
    )
