"""Password hashing, JWT issuing/decoding, and the current-user dependency."""
import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import models
from .database import get_db

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
# In production set SECRET_KEY in the environment. The dev fallback is constant
# so tokens survive a reload, which would be unacceptable in a real deployment.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-shoonya-farms-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_TTL = timedelta(days=7)

IS_DEV_SECRET = SECRET_KEY == "dev-only-insecure-shoonya-farms-secret"

# bcrypt silently truncates anything past 72 bytes; reject it instead so a long
# password can never be quietly equivalent to its first 72 bytes.
MAX_PASSWORD_BYTES = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# auto_error=False lets us raise our own 401 with a WWW-Authenticate header.
bearer_scheme = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Passwords
# ---------------------------------------------------------------------------
def hash_password(plain: str) -> str:
    # Defence in depth: the schema layer rejects over-long passwords at the API
    # edge, but hashing is where the 72-byte limit actually bites, so anything
    # reaching bcrypt by another path (a script, a future caller) fails loudly
    # instead of being silently truncated.
    if len(plain.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError(f"Password exceeds {MAX_PASSWORD_BYTES} bytes.")
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except ValueError:
        # Malformed/legacy hash — treat as a failed login, never a 500.
        return False


# ---------------------------------------------------------------------------
# Tokens
# ---------------------------------------------------------------------------
def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),  # JWT spec: "sub" must be a string
        "iat": int(now.timestamp()),
        "exp": int((now + ACCESS_TOKEN_TTL).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _credentials_error() -> HTTPException:
    """Build a fresh 401.

    A module-level exception instance would be raised from many requests, and
    each raise attaches a new traceback to the same object — which keeps those
    frames (and the DB sessions they reference) alive for the process lifetime.
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Your session has expired. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Resolve the bearer token to a User, or raise 401."""
    if creds is None or not creds.credentials:
        raise _credentials_error()

    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        issued_at = int(payload["iat"])
    except (JWTError, KeyError, TypeError, ValueError):
        raise _credentials_error()

    user = db.get(models.User, user_id)
    if user is None:
        # Valid signature but the account is gone.
        raise _credentials_error()

    # Tokens minted before the last password change are dead, so changing a
    # password ends every other session (and any stolen token with it).
    if issued_at < (user.password_changed_at or 0):
        raise _credentials_error()

    return user
