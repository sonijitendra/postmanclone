"""Health check router."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy", "service": "postman-clone-api"}
