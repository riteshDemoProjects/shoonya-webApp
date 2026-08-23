"""Seed the database from seed_data.PRODUCTS.

Run standalone (from the backend/ directory):
    python -m app.seed          # seed only if empty
    python -m app.seed --force  # wipe catalog and reseed
"""
from . import models
from .database import Base, SessionLocal, engine
from .seed_data import PRODUCTS


def seed(force: bool = False) -> int:
    """Populate products/variants. Returns the number of products inserted."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Product).count() and not force:
            return 0

        if force:
            db.query(models.ProductVariant).delete()
            db.query(models.Product).delete()
            db.commit()

        inserted = 0
        for index, item in enumerate(PRODUCTS):
            product = models.Product(
                slug=item["slug"],
                name=item["name"],
                category=item["category"],
                icon=item["icon"],
                theme=item["theme"],
                description=item.get("description", ""),
                rating=item.get("rating", 4.7),
                reviews=item.get("reviews", 0),
                badge=item.get("badge"),
                featured=item.get("featured", False),
                sort_order=index,
            )
            for label, price, mrp in item["variants"]:
                product.variants.append(
                    models.ProductVariant(label=label, price=price, mrp=mrp, stock=100)
                )
            db.add(product)
            inserted += 1

        db.commit()
        return inserted
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    n = seed(force="--force" in sys.argv)
    print(f"Seeded {n} products." if n else "Catalog already seeded (use --force to reset).")
