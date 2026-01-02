from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint for Railway/monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "hiveforge-api",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes/Railway"""
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat(),
    }
