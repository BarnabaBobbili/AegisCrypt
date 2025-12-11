"""
Test encryption/decryption directly
"""
import sys
sys.path.insert(0, '.')

from app.core.crypto import aes_encrypt, aes_decrypt
import base64

# Test AES encryption/decryption
print("Testing AES encryption/decryption...")
plaintext = "Test message for encryption"

# Encrypt
result = aes_encrypt(plaintext)
print(f"Encryption result keys: {result.keys()}")
print(f"Key (base64): {result.get('key', 'NO KEY!')[:50]}...")
print(f"Ciphertext (base64): {result['ciphertext'][:50]}...")

# Decrypt
key_b64 = result["key"]
key_bytes = base64.b64decode(key_b64)
print(f"\nKey length after decode: {len(key_bytes)} bytes")

decrypted = aes_decrypt(
    ciphertext=result["ciphertext"],
    key=key_bytes,
    nonce=result["nonce"],
    tag=result["tag"]
)

print(f"Decrypted: {decrypted}")
print(f"Match: {decrypted == plaintext}")
