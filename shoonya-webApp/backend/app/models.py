"""SQLAlchemy ORM models: accounts (User), catalog (Product, ProductVariant) and orders."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base

# An order is either still on its way, or finished. Two states only — there is
# no packed/shipped stage in this store.
STATUS_PENDING = "confirmed"
STATUS_DELIVERED = "delivered"


class User(Base):
    """A registered shopper. Login is required to place an order."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)  # stored lowercased
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, default="")

    # Saved delivery address — optional, used to pre-fill checkout.
    address = Column(Text, default="")
    city = Column(String, default="")
    state = Column(String, default="")
    pincode = Column(String, default="")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Unix seconds of the last password change. Tokens issued before this are
    # rejected, so changing your password logs out every other session.
    # Stored as an int to sidestep SQLite's naive/aware datetime comparisons.
    password_changed_at = Column(Integer, default=0, nullable=False)

    orders = relationship(
        "Order",
        back_populates="user",
        order_by="Order.created_at.desc()",
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    icon = Column(String, nullable=False)      # frontend icon key (ghee, honey, ...)
    theme = Column(String, nullable=False)     # media gradient key
    description = Column(Text, default="")
    rating = Column(Float, default=4.7)
    reviews = Column(Integer, default=0)
    badge = Column(String, nullable=True)      # best | new | sale
    featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    variants = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductVariant.id",
    )


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    label = Column(String, nullable=False)     # e.g. "500 ml", "1 kg"
    price = Column(Integer, nullable=False)     # whole rupees (authoritative)
    mrp = Column(Integer, nullable=True)        # strike-through / compare-at price
    stock = Column(Integer, default=100)

    product = relationship("Product", back_populates="variants")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    order_number = Column(String, unique=True, index=True, nullable=False)

    # Nullable so orders placed before accounts existed are still readable.
    # New orders always carry a user_id (checkout requires login).
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    customer_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    payment_method = Column(String, default="cod")  # cod | upi | card (mock)
    subtotal = Column(Integer, nullable=False)
    shipping = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    # Two states: "confirmed" = still on its way (shows under Pending),
    # "delivered" = finished (shows under Order history).
    status = Column(String, default=STATUS_PENDING)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    # Snapshot fields — an order must remain accurate even if the catalog changes.
    product_name = Column(String, nullable=False)
    variant_label = Column(String, nullable=False)
    icon = Column(String, default="combo")
    unit_price = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
