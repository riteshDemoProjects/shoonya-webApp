"""Seed script to create initial admin user for the admin dashboard."""
import os
import secrets
import sys

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base, ensure_schema
from app import models, security


def seed_admin():
    """Create an initial admin user if none exists."""
    db = SessionLocal()
    try:
        # Check if any admin exists
        existing_admin = db.query(models.Admin).first()
        if existing_admin:
            print(f"Admin user already exists: {existing_admin.email}")
            return

        email = os.getenv("ADMIN_EMAIL", "admin@shoonyafarms.com").strip().lower()
        # No hardcoded default: this account is a super_admin, and a known
        # password on a reachable deployment is an open door. When ADMIN_PASSWORD
        # is unset we mint a random one and print it once.
        password = os.getenv("ADMIN_PASSWORD")
        generated = password is None
        if generated:
            password = secrets.token_urlsafe(16)

        admin = models.Admin(
            email=email,
            password_hash=security.hash_password(password),
            full_name=os.getenv("ADMIN_FULL_NAME", "Admin User"),
            role="super_admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Created default admin user:")
        print(f"  Email: {email}")
        if generated:
            print(f"  Password: {password}")
            print("  ^ Generated password, shown only once. Save it now.")
        else:
            print("  Password: (from ADMIN_PASSWORD)")
        print("  Role: super_admin")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Create tables first and apply schema patches
    Base.metadata.create_all(bind=engine)
    patched = ensure_schema()
    if patched:
        print(f"[startup] Schema updated: {', '.join(patched)}")
    seed_admin()
