"""Order endpoints: create (checkout), list your own, and fetch one you own."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["orders"])


@router.post("/orders", response_model=schemas.OrderOut, status_code=201)
def create_order(
    payload: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Place an order. Requires login; the order is attached to the account."""
    try:
        return crud.create_order(db, payload, current_user)
    except crud.CheckoutError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


# NOTE: this must stay declared *above* /orders/{order_number}, otherwise
# FastAPI matches "me" as an order number and this route is unreachable.
@router.get("/orders/me", response_model=List[schemas.OrderOut])
def list_my_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Every order on the account, newest first. The client splits these into
    pending (status "confirmed") and history (status "delivered")."""
    return crud.list_user_orders(db, current_user.id)


def _owned_order_or_404(
    db: Session, order_number: str, current_user: models.User
) -> models.Order:
    order = crud.get_order(db, order_number)
    # 404 rather than 403 for someone else's order — a 403 would confirm that
    # the order number exists and invite enumeration.
    if order is None or order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return order


@router.get("/orders/{order_number}", response_model=schemas.OrderOut)
def get_order(
    order_number: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _owned_order_or_404(db, order_number, current_user)


@router.post("/orders/{order_number}/receive", response_model=schemas.OrderOut)
def receive_order(
    order_number: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirm delivery, moving the order out of Pending and into history.

    A dedicated action rather than a general status field: clients can only make
    this one transition, never set an arbitrary status string.
    """
    order = _owned_order_or_404(db, order_number, current_user)
    return crud.mark_order_received(db, order)
