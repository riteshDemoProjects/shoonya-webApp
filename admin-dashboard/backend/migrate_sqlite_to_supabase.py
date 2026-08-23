"""Copy the existing local SQLite data into the configured PostgreSQL database."""
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app import models
from app.database import DB_PATH, Base, engine as target_engine


TABLES = [
    models.Admin,
    models.User,
    models.Product,
    models.ProductVariant,
    models.Order,
    models.OrderItem,
]


def migrate():
    source_engine = create_engine(f"sqlite:///{DB_PATH}")
    SourceSession = sessionmaker(bind=source_engine)
    source = SourceSession()

    try:
        with target_engine.begin() as connection:
            Base.metadata.create_all(bind=connection)
            target_counts = {
                model.__tablename__: connection.execute(
                    text(f"SELECT COUNT(*) FROM {model.__tablename__}")
                ).scalar_one()
                for model in TABLES
            }
            if any(target_counts.values()):
                raise RuntimeError(
                    "Target database is not empty; refusing to duplicate existing data. "
                    f"Counts: {target_counts}"
                )

            copied = {}
            for model in TABLES:
                rows = source.query(model).all()
                payloads = [
                    {
                        column.name: getattr(row, column.name)
                        for column in model.__table__.columns
                    }
                    for row in rows
                ]
                if payloads:
                    connection.execute(model.__table__.insert(), payloads)
                copied[model.__tablename__] = len(payloads)

            for model in TABLES:
                sequence = connection.execute(
                    text("SELECT pg_get_serial_sequence(:table_name, 'id')"),
                    {"table_name": model.__tablename__},
                ).scalar_one_or_none()
                if sequence and copied[model.__tablename__]:
                    connection.execute(
                        text(
                            "SELECT setval(:sequence_name, "
                            "(SELECT MAX(id) FROM "
                            + model.__tablename__
                            + "), true)"
                        ),
                        {"sequence_name": sequence},
                    )

        print("Migration complete:")
        for table, count in copied.items():
            print(f"  {table}: {count}")
    finally:
        source.close()
        source_engine.dispose()


if __name__ == "__main__":
    if not os.getenv("DATABASE_URL") and not os.getenv("SQLALCHEMY_DATABASE_URL"):
        raise RuntimeError("Set DATABASE_URL to the Supabase PostgreSQL URL first.")
    migrate()
