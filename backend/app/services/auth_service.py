"""
Authentication & RBAC Security Service.

Implements salted PBKDF2 password hashing and standard HS256 JWT tokens
using Python standard libraries (hashlib, hmac, secrets) for zero-dependency
cross-architecture portability on IBM LinuxONE (s390x) and x86_64.
"""

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.db.models import UserRecord

SECRET_KEY = "insura-secure-jwt-secret-key-linuxone-s390x"
SALT_ROUNDS = 100_000


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), SALT_ROUNDS)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password against stored salt and PBKDF2 hash."""
    try:
        if "$" not in stored_hash:
            return False
        salt, key_hex = stored_hash.split("$", 1)
        test_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), SALT_ROUNDS)
        return secrets.compare_digest(test_key.hex(), key_hex)
    except Exception:
        return False


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_id: int, email: str, role: str, expires_in_seconds: int = 86400 * 7) -> str:
    """Create a signed HS256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    h_b64 = _b64url_encode(json.dumps(header).encode("utf-8"))
    p_b64 = _b64url_encode(json.dumps(payload).encode("utf-8"))
    msg = f"{h_b64}.{p_b64}".encode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{h_b64}.{p_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify signature and expiration of JWT access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        h_b64, p_b64, sig_b64 = parts
        msg = f"{h_b64}.{p_b64}".encode("utf-8")
        expected_sig = _b64url_encode(hmac.new(SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).digest())
        if not secrets.compare_digest(sig_b64, expected_sig):
            return None
        payload = json.loads(_b64url_decode(p_b64).decode("utf-8"))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def seed_initial_users(db: Session) -> None:
    """Ensure standard initial accounts exist with pre-hashed credentials."""
    demo_users = [
        {
            "email": "admin@insura.ai",
            "full_name": "Sarah Chen",
            "role": "admin",
            "password": "demo1234",
        },
        {
            "email": "officer@insura.ai",
            "full_name": "Marcus Vance",
            "role": "claims_officer",
            "password": "demo1234",
        },
        {
            "email": "investigator@insura.ai",
            "full_name": "Elena Rostova",
            "role": "investigator",
            "password": "demo1234",
        },
        {
            "email": "analyst@insura.ai",
            "full_name": "David Okafor",
            "role": "analyst",
            "password": "demo1234",
        },
    ]

    for user_info in demo_users:
        existing = db.query(UserRecord).filter(UserRecord.email == user_info["email"]).first()
        if not existing:
            new_user = UserRecord(
                email=user_info["email"],
                full_name=user_info["full_name"],
                role=user_info["role"],
                hashed_password=hash_password(user_info["password"]),
                is_active=1,
            )
            db.add(new_user)
    db.commit()
