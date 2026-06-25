"""FastAPI application factory."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler
from app.database.base import Base
from app.database.session import engine
from app.routers import (
    health,
    collections,
    requests,
    environments,
    history,
    proxy,
    tabs,
    import_export,
    codegen,
)

# Import all models so they are registered with Base.metadata
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Postman Clone API",
    description="Backend API for the Postman Clone application. Acts as a proxy runner for HTTP requests.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)

# Register routers under /api/v1 prefix
API_PREFIX = "/api/v1"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(collections.router, prefix=API_PREFIX)
app.include_router(requests.router, prefix=API_PREFIX)
app.include_router(environments.router, prefix=API_PREFIX)
app.include_router(history.router, prefix=API_PREFIX)
app.include_router(proxy.router, prefix=API_PREFIX)
app.include_router(tabs.router, prefix=API_PREFIX)
app.include_router(import_export.router, prefix=API_PREFIX)
app.include_router(codegen.router, prefix=API_PREFIX)


@app.get("/")
def root():
    """Root endpoint redirect to docs."""
    return {"message": "Postman Clone API", "docs": "/api/docs"}
