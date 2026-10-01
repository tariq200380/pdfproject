"""FastAPI main application entrypoint for OmniMedia & PDF Studio."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes_health import router as health_router
from backend.app.api.routes_pdf import router as pdf_router
from backend.app.core.config import settings
from backend.app.core.sandbox import sandbox_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("omnistudio.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages background threads across application lifecycle."""
    logger.info("Initializing OmniMedia & PDF Studio backend...")
    sandbox_manager.start_reaper()
    yield
    logger.info("Shutting down OmniMedia & PDF Studio backend...")
    sandbox_manager.stop_reaper()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Stateless backend API for in-place PDF editing, universal media conversion, and smart compression.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration allowing Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(pdf_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "documentation": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }
