"""FastAPI main application entrypoint for Creed-Tech Studio."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes_health import router as health_router
from backend.app.api.routes_pdf import router as pdf_router
from backend.app.api.routes_media import router as media_router
from backend.app.api.routes_compress import router as compress_router
from backend.app.api.routes_converters import router as converters_router
from backend.app.core.config import settings
from backend.app.core.sandbox import sandbox_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("creedtech.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages background threads across application lifecycle."""
    logger.info("Initializing Creed-Tech Studio backend...")
    sandbox_manager.start_reaper()
    yield
    logger.info("Shutting down Creed-Tech Studio backend...")
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


@app.middleware("http")
async def security_and_limits_middleware(request: Request, call_next):
    """Applies OWASP security headers and checks Content-Length limits."""
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            length_bytes = int(content_length)
            max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
            if length_bytes > max_bytes:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": f"Payload size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB"},
                )
        except ValueError:
            pass

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(pdf_router, prefix=settings.API_PREFIX)
app.include_router(media_router, prefix=settings.API_PREFIX)
app.include_router(compress_router, prefix=settings.API_PREFIX)
app.include_router(converters_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "documentation": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }
