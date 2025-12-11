"""
Test full encryption service flow
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from app.database import engine
from app.models.user import User
from app.models.data_classification import SensitivityLevel
from app.services.encryption_service import EncryptionService

# Create a test session
session = Session(engine)

# Get a test user (admin)
user = session.query(User).filter(User.username == "admin").first()
if not user:
    print("Admin user not found!")
    sys.exit(1)

print(f"Testing with user: {user.username}")

# Create encryption service
service = EncryptionService(session)

# Test encryption
print("\n1. Encrypting data...")
plaintext = "Test data for end-to-end encryption"
data_item = service.encrypt_and_store(
    content=plaintext,
    sensitivity_level=SensitivityLevel.PUBLIC,
    user=user
)

print(f"   Created data item ID: {data_item.id}")
print(f"   Algorithm: {data_item.encryption_algorithm}")
print(f"   Key ID length: {len(data_item.encryption_key_id)}")

# Test decryption
print("\n2. Decrypting data...")
try:
    result = service.decrypt_data(data_item)
    print(f"   Decrypted text: {result['decrypted_text']}")
    print(f"   Hash verified: {result['hash_verified']}")
    print(f"   Match: {result['decrypted_text'] == plaintext}")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

# Cleanup
print("\n3. Cleaning up...")
session.delete(data_item)
session.commit()
session.close()
print("Done!")
