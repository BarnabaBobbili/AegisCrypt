"""
Create sample encryption policies for testing
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.encryption_policy import EncryptionPolicy

def create_sample_policies():
    """Create default encryption policies for each sensitivity level."""
    db: Session = SessionLocal()
    
    try:
        # Check if policies already exist
        existing = db.query(EncryptionPolicy).count()
        if existing > 0:
            print(f"❌ {existing} policies already exist. Skipping creation.")
            return
        
        policies_data = [
            {
                "sensitivity_level": "public",
                "encryption_algorithm": "AES-128-GCM",
                "key_size": 128,
                "hash_algorithm": "SHA-256",
                "signature_required": False,
                "mfa_required": "none",
                "description": "Basic encryption for public data with minimal security requirements."
            },
            {
                "sensitivity_level": "internal",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "hash_algorithm": "SHA-256",
                "signature_required": False,
                "mfa_required": "recommended",
                "asymmetric_algorithm": "RSA-2048",
                "description": "Standard encryption for internal business data requiring moderate protection."
            },
            {
                "sensitivity_level": "confidential",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "hash_algorithm": "SHA-512",
                "signature_required": True,
                "mfa_required": "conditional",
                "asymmetric_algorithm": "RSA-4096",
                "description": "Strong encryption for confidential data with signature verification."
            },
            {
                "sensitivity_level": "highly_sensitive",
                "encryption_algorithm": "AES-256-GCM",
                "key_size": 256,
                "hash_algorithm": "SHA-512",
                "signature_required": True,
                "mfa_required": "required",
                "asymmetric_algorithm": "RSA-4096",
                "description": "Maximum security for highly sensitive data requiring MFA and digital signatures."
            }
        ]
        
        created_count = 0
        for policy_data in policies_data:
            policy = EncryptionPolicy(**policy_data)
            db.add(policy)
            created_count += 1
        
        db.commit()
        
        print(f"✅ Successfully created {created_count} sample policies!")
        print(f"   - Public")
        print(f"   - Internal")
        print(f"   - Confidential")
        print(f"   - Highly Sensitive")
        print(f"\n   🔐 Refresh the Policies page to see them!")
        
    except Exception as e:
        print(f"❌ Error creating policies: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_policies()
