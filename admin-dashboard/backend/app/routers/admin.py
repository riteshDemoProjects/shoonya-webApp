"""Admin API endpoints: auth, dashboard, products, orders, users."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, security
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_products: int
    total_orders: int
    total_users: int
    total_revenue: int
    pending_orders: int
    delivered_orders: int


class AnalyticsPoint(BaseModel):
    date: str
    orders: int
    revenue: int


class ProductVariantIn(BaseModel):
    label: str
    price: int
    mrp: Optional[int] = None
    stock: int = 100


class ProductVariantOut(ProductVariantIn):
    id: int

    class Config:
        from_attributes = True


class ProductIn(BaseModel):
    slug: str
    name: str
    category: str
    icon: str
    theme: str
    description: str = ""
    rating: float = 4.7
    reviews: int = 0
    badge: Optional[str] = None
    featured: bool = False
    sort_order: int = 0
    variants: List[ProductVariantIn] = []


class ProductOut(ProductIn):
    id: int
    variants: List[ProductVariantOut] = []

    class Config:
        from_attributes = True


class ProductListItem(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    icon: str
    theme: str
    rating: float
    reviews: int
    badge: Optional[str]
    featured: bool
    sort_order: int
    variants_count: int
    min_price: int
    total_stock: int

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    name: str
    count: int


class OrderItemOut(BaseModel):
    id: int
    product_name: str
    variant_label: str
    icon: str
    unit_price: int
    quantity: int
    line_total: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int]
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
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    created_at: datetime
    orders_count: int
    total_spent: int

    class Config:
        from_attributes = True


class UserDetailOut(UserOut):
    orders: List[OrderOut] = []

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    admin = security.authenticate_admin(db, payload.email, payload.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = security.create_access_token({"sub": admin.email, "admin_id": admin.id})
    admin.last_login = datetime.now(timezone.utc)
    db.commit()
    return {"access_token": token}


@router.get("/me", response_model=AdminOut)
def get_me(admin: models.Admin = Depends(security.get_current_admin)):
    return admin


# ---------------------------------------------------------------------------
# Dashboard endpoints
# ---------------------------------------------------------------------------

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(models.Order.total), 0)).scalar() or 0
    pending_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.status == models.STATUS_PENDING
    ).scalar() or 0
    delivered_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.status == models.STATUS_DELIVERED
    ).scalar() or 0

    return DashboardStats(
        total_products=total_products,
        total_orders=total_orders,
        total_users=total_users,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
    )


@router.get("/dashboard/analytics", response_model=List[AnalyticsPoint])
def get_analytics(
    days: int = Query(30, ge=1, le=365),
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    orders = db.query(models.Order).filter(models.Order.created_at >= since).all()

    # Group by date
    daily = {}
    for order in orders:
        date_key = order.created_at.date().isoformat()
        if date_key not in daily:
            daily[date_key] = {"orders": 0, "revenue": 0}
        daily[date_key]["orders"] += 1
        daily[date_key]["revenue"] += order.total

    # Fill missing dates with zeros
    result = []
    for i in range(days):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat()
        data = daily.get(date, {"orders": 0, "revenue": 0})
        result.append(AnalyticsPoint(date=date, orders=data["orders"], revenue=data["revenue"]))

    return list(reversed(result))


# ---------------------------------------------------------------------------
# Products endpoints
# ---------------------------------------------------------------------------

@router.get("/products", response_model=List[ProductListItem])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)

    if category and category != "all":
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%") | models.Product.slug.ilike(f"%{search}%")
        )

    query = query.order_by(models.Product.sort_order, models.Product.id)
    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for p in products:
        variants = p.variants
        min_price = min((v.price for v in variants), default=0)
        total_stock = sum(v.stock for v in variants)
        result.append(ProductListItem(
            id=p.id,
            slug=p.slug,
            name=p.name,
            category=p.category,
            icon=p.icon,
            theme=p.theme,
            rating=p.rating,
            reviews=p.reviews,
            badge=p.badge,
            featured=p.featured,
            sort_order=p.sort_order,
            variants_count=len(variants),
            min_price=min_price,
            total_stock=total_stock,
        ))
    return result


@router.get("/products/categories", response_model=List[CategoryOut])
def get_categories(
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    rows = db.query(models.Product.category, func.count(models.Product.id)).group_by(
        models.Product.category
    ).all()
    return [CategoryOut(name=cat, count=cnt) for cat, cnt in rows]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductIn,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    # Check slug uniqueness
    existing = db.query(models.Product).filter(models.Product.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    product = models.Product(
        slug=payload.slug,
        name=payload.name,
        category=payload.category,
        icon=payload.icon,
        theme=payload.theme,
        description=payload.description,
        rating=payload.rating,
        reviews=payload.reviews,
        badge=payload.badge,
        featured=payload.featured,
        sort_order=payload.sort_order,
    )
    db.add(product)
    db.flush()

    for v in payload.variants:
        variant = models.ProductVariant(
            product_id=product.id,
            label=v.label,
            price=v.price,
            mrp=v.mrp,
            stock=v.stock,
        )
        db.add(variant)

    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductIn,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check slug uniqueness (excluding current product)
    existing = db.query(models.Product).filter(
        models.Product.slug == payload.slug, models.Product.id != product_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    # Update product fields
    for field, value in payload.model_dump(exclude={"variants"}).items():
        setattr(product, field, value)

    # Replace variants
    db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).delete()
    for v in payload.variants:
        variant = models.ProductVariant(
            product_id=product.id,
            label=v.label,
            price=v.price,
            mrp=v.mrp,
            stock=v.stock,
        )
        db.add(variant)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


# ---------------------------------------------------------------------------
# Orders endpoints
# ---------------------------------------------------------------------------

@router.get("/orders", response_model=List[OrderOut])
def get_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.Order).order_by(models.Order.created_at.desc())

    if status and status != "all":
        query = query.filter(models.Order.status == status)

    total = query.count()
    orders = query.offset((page - 1) * per_page).limit(per_page).all()
    return orders


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.status not in [models.STATUS_PENDING, models.STATUS_DELIVERED]:
        raise HTTPException(status_code=400, detail="Invalid status")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


# ---------------------------------------------------------------------------
# Users endpoints
# ---------------------------------------------------------------------------

@router.get("/users", response_model=List[UserOut])
def get_users(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.User)

    if search:
        query = query.filter(
            models.User.full_name.ilike(f"%{search}%")
            | models.User.email.ilike(f"%{search}%")
            | models.User.phone.ilike(f"%{search}%")
        )

    query = query.order_by(models.User.created_at.desc())
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for u in users:
        orders_count = db.query(func.count(models.Order.id)).filter(models.Order.user_id == u.id).scalar() or 0
        total_spent = db.query(func.coalesce(func.sum(models.Order.total), 0)).filter(
            models.Order.user_id == u.id
        ).scalar() or 0
        result.append(UserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            phone=u.phone,
            address=u.address,
            city=u.city,
            state=u.state,
            pincode=u.pincode,
            created_at=u.created_at,
            orders_count=orders_count,
            total_spent=total_spent,
        ))
    return result


@router.get("/users/{user_id}", response_model=UserDetailOut)
def get_user(
    user_id: int,
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(
        models.Order.created_at.desc()
    ).all()

    orders_count = len(orders)
    total_spent = sum(o.total for o in orders)

    return UserDetailOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        city=user.city,
        state=user.state,
        pincode=user.pincode,
        created_at=user.created_at,
        orders_count=orders_count,
        total_spent=total_spent,
        orders=orders,
    )


@router.get("/users/{user_id}/orders", response_model=List[OrderOut])
def get_user_orders(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: models.Admin = Depends(security.get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(
        models.Order.created_at.desc()
    )
    total = query.count()
    orders = query.offset((page - 1) * per_page).limit(per_page).all()
    return orders