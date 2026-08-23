"""Shoonya Farms API — FastAPI application entry point."""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import security
from .database import Base, engine, ensure_schema
from .routers import auth, orders, products
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and auto-seed the catalog on first run. This service owns the
    # shared schema; the admin API skips its own create_all in production.
    Base.metadata.create_all(bind=engine)
    patched = ensure_schema()
    if patched:
        print(f"[startup] Schema updated: {', '.join(patched)}")
    inserted = seed()
    if inserted:
        print(f"[startup] Seeded {inserted} products into the catalog.")
    if security.IS_DEV_SECRET:
        print(
            "[startup] WARNING: using the built-in development SECRET_KEY. "
            "Set the SECRET_KEY environment variable before deploying."
        )
    yield


app = FastAPI(title="Shoonya Farms API", version="1.0.0", lifespan=lifespan)

# In production the SPA is served same-origin — the proxy in front forwards
# /api/* to this service — so no CORS is involved. ALLOWED_ORIGINS (comma
# separated) covers a cross-origin deployment; unset, any localhost port is
# allowed so local development keeps working.
_allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
if _allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "shoonya-farms-api"}
