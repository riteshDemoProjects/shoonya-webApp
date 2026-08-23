"""Password hashing, JWT issuing/decoding, and the current-admin dependency."""
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
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + ACCESS_TOKEN_TTL
    to_encode.update({"iat": int(now.timestamp()), "exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


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


def authenticate_admin(db: Session, email: str, password: str) -> models.Admin | None:
    """Authenticate admin by email and password."""
    admin = db.query(models.Admin).filter(models.Admin.email == email.lower()).first()
    if not admin:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin


def get_current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.Admin:
    """Resolve the bearer token to an Admin, or raise 401."""
    if creds is None or not creds.credentials:
        raise _credentials_error()

    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = int(payload.get("admin_id", 0))
        email = payload.get("sub")
        if not admin_id or not email:
            raise _credentials_error()
    except (JWTError, KeyError, TypeError, ValueError):
        raise _credentials_error()

    admin = db.get(models.Admin, admin_id)
    if admin is None:
        # Valid signature but the account is gone.
        raise _credentials_error()

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    return admin