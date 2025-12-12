"""
Create default admin user for dashboard access
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_admin_user():
    """Create a default admin user if it doesn't exist."""
    db: Session = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        
        if existing_admin:
            print("❌ Admin user already exists!")
            print(f"   Username: admin")
            print(f"   To reset password, delete the user first")
            return
        
        # Create admin user
        admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Default admin user created successfully!")
        print(f"   Username: admin")
        print(f"   Password: admin123")
        print(f"   Role: ADMIN")
        print(f"\n   🔐 Please login at: http://localhost:5173/login")
        print(f"   ⚠️  Change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
