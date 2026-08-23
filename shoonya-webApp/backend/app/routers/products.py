"""Catalog endpoints: products and categories."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/products", response_model=List[schemas.ProductOut])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("featured"),
    db: Session = Depends(get_db),
):
    return crud.list_products(db, category=category, search=search, sort=sort)


@router.get("/categories", response_model=List[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return crud.list_categories(db)


@router.get("/products/{slug}", response_model=schemas.ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = crud.get_product(db, slug)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
