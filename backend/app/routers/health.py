"""Health check endpoint."""

from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Report service status. No health data is stored or read here."""
    return HealthResponse(
        status="ok",
        service="HerHealth AI",
        version="0.1.0",
        model_available=False,
    )