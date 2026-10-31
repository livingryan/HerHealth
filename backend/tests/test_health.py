"""Tests for the health endpoint."""

from app.schemas import HealthResponse


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = HealthResponse.model_validate(response.json())
    assert data.status == "ok"
    assert data.service == "HerHealth AI"
    assert data.model_available is False