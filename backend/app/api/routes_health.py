"""Health check and system info endpoint."""

from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.core.sandbox import sandbox_manager

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Returns service health status and configuration info."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "ephemeral_storage": str(sandbox_manager.base_dir),
        "session_ttl_minutes": settings.SESSION_TTL_MINUTES,
    }
