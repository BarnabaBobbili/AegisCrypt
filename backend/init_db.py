"""
Simplified Data

base Initialization Script
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models.user import User, UserRole
from app.models.encryption_policy import EncryptionPolicy, MFARequirement
from app.core.security import hash_password

# Import all models to ensure they're registered
from app.models import user, data_classification, encryption_policy, audit_log

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")


def seed_policies(db: Session):
    """Seed default encryption policies."""
    print("Seeding default encryption policies...")
    
    default_policies = [
        {
            "sensitivity_level": "public",
            "encryption_algorithm": "AES-128-GCM",
            "key_size": 128,
            "hash_algorithm": "SHA-256",
            "signature_required": False,
            "mfa_required": MFARequirement.NONE,
            "description": "Minimal protection for public data"
        },
        {
            "sensitivity_level": "internal",
            "encryption_algorithm": "AES-256-GCM",
            "key_size": 256,
            "hash_algorithm": "SHA-256",
            "signature_required": False,
            "mfa_required": MFARequirement.NONE,
            "description": "Standard protection for internal data"
        },
        {
            "sensitivity_level": "confidential",
            "encryption_algorithm": "AES-256-GCM",
            "key_size": 256,
            "hash_algorithm": "SHA-512",
            "signature_required": True,
            "mfa_required": MFARequirement.CONDITIONAL,
            "description": "Strong protection for confidential data"
        },
        {
            "sensitivity_level": "highly_sensitive",
            "encryption_algorithm": "AES-256-GCM",
            "key_size": 256,
            "asymmetric_algorithm": "RSA-2048",
            "asymmetric_key_size": 2048,
            "hash_algorithm": "SHA-512",
            "signature_required": True,
            "mfa_required": MFARequirement.REQUIRED,
            "description": "Maximum protection for highly sensitive data"
        }
    ]
    
    for policy_data in default_policies:
        existing = db.query(EncryptionPolicy).filter(
            EncryptionPolicy.sensitivity_level == policy_data["sensitivity_level"]
        ).first()
        
        if not existing:
            policy = EncryptionPolicy(**policy_data)
            db.add(policy)
            print(f"  Created policy: {policy_data['sensitivity_level']}")
    
    db.commit()
    print("✅ Default policies created successfully")


def create_users(db: Session):
    """Create default users."""
    print("Creating default users...")
    
    users_data = [
        {
            "username": "admin",
            "email": "admin@example.com",
            "password": "Admin@123",
            "role": UserRole.ADMIN,
        },
        {
            "username": "manager1",
            "email": "manager@example.com",
            "password": "Manager@123",
            "role": UserRole.MANAGER,
        },
        {
            "username": "user1",
            "email": "user@example.com",
            "password": "User@123",
            "role": UserRole.USER,
        },
        {
            "username": "guest1",
            "email": "guest@example.com",
            "password": "Guest@123",
            "role": UserRole.GUEST,
        },
    ]
    
    for user_data in users_data:
        existing = db.query(User).filter(User.username == user_data["username"]).first()
        
        if not existing:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
                is_active=True,
            )
            db.add(user)
            print(f"  Created user: {user_data['username']} ({user_data['role'].value})")
        else:
            print(f"  User {user_data['username']} already exists")
    
    db.commit()
    print("✅ Default users created successfully")


def main():
    """Main initialization function."""
    print("=" * 60)
    print("DATABASE INITIALIZATION")
    print("=" * 60)
    
    try:
        # Create tables
        create_tables()
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Seed policies
            seed_policies(db)
            
            # Create users
            create_users(db)
            
            print("=" * 60)
            print("✅ DATABASE INITIALIZATION COMPLETE")
            print("=" * 60)
            print("\nDefault Login Credentials:")
            print("  Admin:    admin / Admin@123")
            print("  Manager:  manager1 / Manager@123")
            print("  User:     user1 / User@123")
            print("  Guest:    guest1 / Guest@123")
            print("\n⚠️  CHANGE THESE PASSWORDS IN PRODUCTION!")
            print("=" * 60)
            
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            db.rollback()
            raise
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
