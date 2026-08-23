"""Data-access helpers: accounts, product queries, and order creation with server-side pricing."""
import re
import secrets
from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from . import models, schemas, security

FREE_SHIPPING_THRESHOLD = 999   # rupees
SHIPPING_FEE = 49               # rupees

# Controls the order categories appear in the storefront filter bar.
CATEGORY_ORDER = [
    "Ghee",
    "Honey",
    "Cold-Pressed Oils",
    "Essential Oils",
    "Dals & Pulses",
    "Atta & Grains",
    "Sweeteners",
    "Spices & Salt",
    "Combos",
]


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------
class EmailTakenError(Exception):
    """Raised when an email already belongs to another account."""


class PasswordError(Exception):
    """Raised when the supplied current password doesn't match."""


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email.strip().lower())
        .first()
    )


def create_user(db: Session, payload: schemas.UserRegister) -> models.User:
    # NOTE: orders placed before accounts existed keep user_id = NULL and stay
    # invisible to everyone. Adopting them by matching the email would be a data
    # leak: nothing here proves the registrant controls that address, so anyone
    # could sign up as someone@else.com and read their name, phone, delivery
    # address and line items. Claiming them safely needs verified email.
    if get_user_by_email(db, payload.email):
        raise EmailTakenError("An account with this email already exists.")

    user = models.User(
        email=payload.email,  # already lowercased by the schema
        password_hash=security.hash_password(payload.password),
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: schemas.UserLogin):
    """Return the User on a correct email+password, else None."""
    user = get_user_by_email(db, payload.email)
    if user is None or not security.verify_password(payload.password, user.password_hash):
        return None
    return user


def update_user(db: Session, user: models.User, payload: schemas.UserUpdate) -> models.User:
    data = payload.model_dump(exclude_unset=True)

    new_email = data.get("email")
    if new_email and new_email != user.email:
        existing = get_user_by_email(db, new_email)
        if existing and existing.id != user.id:
            raise EmailTakenError("That email is already in use.")

    for field in ("full_name", "email", "phone", "address", "city", "state", "pincode"):
        if field in data and data[field] is not None:
            setattr(user, field, data[field].strip())

    db.commit()
    db.refresh(user)
    return user


def change_password(
    db: Session, user: models.User, payload: schemas.PasswordChange
) -> models.User:
    if not security.verify_password(payload.current_password, user.password_hash):
        raise PasswordError("Your current password is incorrect.")
    user.password_hash = security.hash_password(payload.new_password)
    # Stamping this invalidates every token issued before now, so a stolen token
    # stops working the moment the real owner changes their password.
    user.password_changed_at = int(datetime.now(timezone.utc).timestamp())
    db.commit()
    db.refresh(user)
    return user


def reset_password(db: Session, payload: schemas.PasswordReset) -> bool:
    user = get_user_by_email(db, payload.email)
    if user is None:
        return False
    user.password_hash = security.hash_password(payload.new_password)
    user.password_changed_at = int(datetime.now(timezone.utc).timestamp())
    db.commit()
    return True


def save_address_from_order(db: Session, user: models.User, payload: schemas.OrderCreate) -> None:
    """Persist the delivery details used at checkout onto the account."""
    # The checkout name is the more recent intent, so it wins — `or` here would
    # have made this a no-op, since full_name is required at registration.
    user.full_name = payload.customer_name.strip() or user.full_name
    user.phone = payload.phone.strip()
    user.address = payload.address.strip()
    user.city = payload.city.strip()
    user.state = payload.state.strip()
    user.pincode = payload.pincode.strip()
    db.commit()


def category_slug(name: str) -> str:
    """URL-friendly key for a category name, e.g. 'Cold-Pressed Oils' -> 'cold-pressed-oils'.

    Must stay in sync with the frontend's catKeyFromName().
    """
    s = name.lower().replace("&", "and")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def _resolve_category(db: Session, value: str) -> str:
    """Map an incoming category filter (slug or exact name) to the stored name."""
    names = [row[0] for row in db.query(models.Product.category).distinct().all()]
    for name in names:
        if value == name or value == category_slug(name):
            return name
    return value  # no match -> filter yields nothing, which is correct


def _min_price(product: models.Product) -> int:
    return min((v.price for v in product.variants), default=0)


def list_products(db: Session, category=None, search=None, sort="featured"):
    query = db.query(models.Product).options(selectinload(models.Product.variants))

    if category and category != "all":
        query = query.filter(models.Product.category == _resolve_category(db, category))

    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(like),
                models.Product.category.ilike(like),
                models.Product.description.ilike(like),
            )
        )

    products = query.all()

    if sort == "price-asc":
        products.sort(key=_min_price)
    elif sort == "price-desc":
        products.sort(key=_min_price, reverse=True)
    elif sort == "name":
        products.sort(key=lambda p: p.name.lower())
    elif sort == "rating":
        products.sort(key=lambda p: (p.rating, p.reviews), reverse=True)
    else:  # featured
        products.sort(key=lambda p: (not p.featured, p.sort_order, p.name.lower()))

    return products


def get_product(db: Session, slug: str):
    return (
        db.query(models.Product)
        .options(selectinload(models.Product.variants))
        .filter(models.Product.slug == slug)
        .first()
    )


def list_categories(db: Session):
    rows = (
        db.query(models.Product.category, func.count(models.Product.id))
        .group_by(models.Product.category)
        .all()
    )
    counts = {cat: n for cat, n in rows}
    total = sum(counts.values())

    result = [{"key": "all", "name": "All Products", "count": total}]
    seen = set()
    for cat in CATEGORY_ORDER:
        if cat in counts:
            result.append({"key": category_slug(cat), "name": cat, "count": counts[cat]})
            seen.add(cat)
    for cat, n in counts.items():
        if cat not in seen:
            result.append({"key": category_slug(cat), "name": cat, "count": n})
    return result


def _generate_order_number(db: Session) -> str:
    stamp = datetime.now(timezone.utc).strftime("%y%m%d")
    while True:
        number = f"SF{stamp}{secrets.token_hex(2).upper()}"
        if not db.query(models.Order).filter_by(order_number=number).first():
            return number


class CheckoutError(Exception):
    """Raised when an order cannot be created (bad variant, stock, etc.)."""


def create_order(
    db: Session, payload: schemas.OrderCreate, user: models.User
) -> models.Order:
    subtotal = 0
    resolved = []  # (variant, qty, line_total)

    for item in payload.items:
        variant = (
            db.query(models.ProductVariant)
            .options(selectinload(models.ProductVariant.product))
            .filter_by(id=item.variant_id)
            .first()
        )
        if variant is None:
            raise CheckoutError(f"Product variant {item.variant_id} no longer exists.")
        if variant.stock < item.quantity:
            raise CheckoutError(
                f"Only {variant.stock} left of {variant.product.name} ({variant.label})."
            )
        line_total = variant.price * item.quantity
        subtotal += line_total
        resolved.append((variant, item.quantity, line_total))

    shipping = 0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_FEE
    total = subtotal + shipping

    order = models.Order(
        order_number=_generate_order_number(db),
        user_id=user.id,
        customer_name=payload.customer_name.strip(),
        email=payload.email.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        city=payload.city.strip(),
        state=payload.state.strip(),
        pincode=payload.pincode.strip(),
        payment_method=payload.payment_method,
        subtotal=subtotal,
        shipping=shipping,
        total=total,
    )

    for variant, qty, line_total in resolved:
        order.items.append(
            models.OrderItem(
                product_name=variant.product.name,
                variant_label=variant.label,
                icon=variant.product.icon,
                unit_price=variant.price,
                quantity=qty,
                line_total=line_total,
            )
        )
        variant.stock -= qty

    db.add(order)
    db.commit()
    db.refresh(order)

    if payload.save_address:
        save_address_from_order(db, user, payload)

    return order


def get_order(db: Session, order_number: str):
    return (
        db.query(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.order_number == order_number)
        .first()
    )


def list_user_orders(db: Session, user_id: int):
    """All of a user's orders, newest first, with items eagerly loaded."""
    return (
        db.query(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc(), models.Order.id.desc())
        .all()
    )


def mark_order_received(db: Session, order: models.Order) -> models.Order:
    """Move an order from pending into history.

    This store has no admin panel and no courier webhook, so the shopper
    confirming delivery is the only honest way an order can reach the
    "delivered" state. Idempotent: re-confirming an order is not an error.
    """
    if order.status != models.STATUS_DELIVERED:
        order.status = models.STATUS_DELIVERED
        db.commit()
        db.refresh(order)
    return order
