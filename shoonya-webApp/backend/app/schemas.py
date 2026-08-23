"""Pydantic schemas for request/response validation."""
import re
from datetime import datetime
from typing import Annotated, List, Optional

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

# Deliberately permissive: enough to catch typos without pulling in the
# email-validator dependency. Mirrors the frontend's check.
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")
MAX_PASSWORD_BYTES = 72  # bcrypt's hard limit


def normalize_email(v: str) -> str:
    """Lowercase + trim an address, rejecting obvious non-addresses.

    Email is the login identity, so it has to be stored in exactly one form —
    otherwise "Priya@Email.com" becomes a second, unreachable account.
    """
    v = v.strip().lower()
    if not EMAIL_RE.match(v):
        raise ValueError("Enter a valid email address.")
    return v


def check_password_length(v: str) -> str:
    """bcrypt ignores everything past 72 bytes, so reject longer passwords
    rather than let one be silently equivalent to its first 72 bytes."""
    if len(v.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError("Password is too long (max 72 bytes).")
    return v


# Reusable constrained types. Annotated keeps the validator attached to the
# type itself, so every field that uses it gets the same treatment.
NormalizedEmail = Annotated[
    str, Field(min_length=5, max_length=120), AfterValidator(normalize_email)
]
NewPassword = Annotated[
    str, Field(min_length=8, max_length=128), AfterValidator(check_password_length)
]


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------
class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    email: NormalizedEmail
    password: NewPassword
    phone: str = Field(default="", max_length=20)


class UserLogin(BaseModel):
    email: NormalizedEmail
    # No length floor here — an existing password shouldn't fail validation
    # just because the rules tightened after it was set.
    password: str = Field(min_length=1, max_length=128)


class UserUpdate(BaseModel):
    """Profile edit — every field optional, only what's sent gets changed."""

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    email: Optional[NormalizedEmail] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=300)
    city: Optional[str] = Field(default=None, max_length=80)
    state: Optional[str] = Field(default=None, max_length=80)
    pincode: Optional[str] = Field(default=None, max_length=10)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: NewPassword


class PasswordReset(BaseModel):
    email: NormalizedEmail
    new_password: NewPassword


class UserOut(BaseModel):
    """Public account shape — deliberately never includes password_hash."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    phone: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------
class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    label: str
    price: int
    mrp: Optional[int] = None
    stock: int


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    name: str
    category: str
    icon: str
    theme: str
    description: str
    rating: float
    reviews: int
    badge: Optional[str] = None
    featured: bool
    variants: List[VariantOut]


class CategoryOut(BaseModel):
    key: str
    name: str
    count: int


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class OrderItemIn(BaseModel):
    variant_id: int
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=80)
    email: NormalizedEmail
    phone: str = Field(min_length=7, max_length=20)
    address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=80)
    state: str = Field(min_length=2, max_length=80)
    pincode: str = Field(min_length=4, max_length=10)
    payment_method: str = "cod"
    items: List[OrderItemIn] = Field(min_length=1)
    # When true, these delivery details are also saved onto the account so the
    # next checkout pre-fills itself.
    save_address: bool = False


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_name: str
    variant_label: str
    icon: str
    unit_price: int
    quantity: int
    line_total: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    customer_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    payment_method: str
    subtotal: int
    shipping: int
    total: int
    status: str  # "confirmed" (pending) | "delivered" (history)
    created_at: datetime
    items: List[OrderItemOut]
