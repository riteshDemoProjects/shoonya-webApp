"""Database engine, session, and Base for the Shoonya Farms API."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "shoonya.db"))

def database_url() -> str:
    """Return a SQLAlchemy URL for local SQLite or Supabase PostgreSQL."""
    url = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}").strip()
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


SQLALCHEMY_DATABASE_URL = database_url()

connect_args = (
    {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    """Apply additive, idempotent schema patches to an existing SQLite file.

    `Base.metadata.create_all` creates missing *tables* but never alters existing
    ones, so a database created before accounts existed would keep an `orders`
    table with no `user_id` column and every query against it would fail. This
    adds the column in place, so no one has to delete shoonya.db to upgrade.

    Safe to run on every boot: each patch checks first and skips if applied.
    """
    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        return []  # real migrations (Alembic) belong on real databases

    # (table, column, DDL type) — appended columns only; SQLite cannot drop or
    # retype a column without rebuilding the table.
    patches = [
        ("orders", "user_id", "INTEGER REFERENCES users(id)"),
        # For a `users` table created before token invalidation existed.
        ("users", "password_changed_at", "INTEGER NOT NULL DEFAULT 0"),
    ]
    # ALTER TABLE ADD COLUMN cannot carry an index, so declare them separately.
    indexes = [("ix_orders_user_id", "orders", "user_id")]
    applied = []

    with engine.begin() as conn:
        def columns_of(table):
            rows = conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
            return {row[1] for row in rows}

        for table, column, ddl_type in patches:
            existing = columns_of(table)
            if not existing:
                continue  # table doesn't exist yet — create_all built it correctly
            if column in existing:
                continue  # already present
            conn.exec_driver_sql(
                f"ALTER TABLE {table} ADD COLUMN {column} {ddl_type}"
            )
            applied.append(f"{table}.{column}")

        # Every "my orders" request filters on orders.user_id, so it needs an
        # index. create_all would have made one on a fresh DB, but a column
        # added by ALTER TABLE above arrives without it.
        for name, table, column in indexes:
            if column not in columns_of(table):
                continue
            conn.exec_driver_sql(
                f"CREATE INDEX IF NOT EXISTS {name} ON {table}({column})"
            )

    return applied
