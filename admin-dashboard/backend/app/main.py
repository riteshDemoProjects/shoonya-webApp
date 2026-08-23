"""Shoonya Farms Admin API — FastAPI application entry point."""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import security
from .database import Base, engine, ensure_schema
from .routers import admin


def _env_flag(name: str, default: str = "1") -> bool:
    return os.getenv(name, default).strip().lower() not in {"0", "false", "no", ""}


# The admin and the main site share one database. If both processes run
# create_all against PostgreSQL at the same time they can deadlock on the system
# catalogs, so the main site owns the schema and the admin skips it in production.
RUN_SCHEMA_INIT = _env_flag("RUN_SCHEMA_INIT")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if RUN_SCHEMA_INIT:
        # Create tables and apply schema patches
        Base.metadata.create_all(bind=engine)
        patched = ensure_schema()
        if patched:
            print(f"[startup] Schema updated: {', '.join(patched)}")
    if security.IS_DEV_SECRET:
        print(
            "[startup] WARNING: using the built-in development SECRET_KEY. "
            "Set the SECRET_KEY environment variable before deploying."
        )
    yield


app = FastAPI(title="Shoonya Farms Admin API", version="1.0.0", lifespan=lifespan)

# In production the SPA is served same-origin — the proxy in front forwards
# /admin/* to this service — so no CORS is involved. ALLOWED_ORIGINS (comma
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

app.include_router(admin.router)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "shoonya-farms-admin-api"}
