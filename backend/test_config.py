"""
Test script to verify .env configuration
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

try:
    from app.config import settings
    print("✅ Configuration loaded successfully!")
    print(f"\nApp Name: {settings.APP_NAME}")
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"Secret Key: {settings.SECRET_KEY[:20]}... (truncated)")
    print(f"Debug Mode: {settings.DEBUG}")
    print("\n✅ All settings loaded correctly!")
except Exception as e:
    print(f"❌ Error loading configuration:")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("\nPlease check your .env file for:")
    print("1. Correct SECRET_KEY value (no quotes, no special characters causing issues)")
    print("2. No spaces around = signs")
    print("3. Boolean values should be True/False (not true/false)")
    import traceback
    traceback.print_exc()
