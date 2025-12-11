"""
Test database initialization with full traceback
"""
import traceback

try:
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent))
    
    from app.database import init_db, Base, engine
    from app.models import User, DataItem, EncryptionPolicy, AuditLog
    
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()
