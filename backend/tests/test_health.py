"""
Health, Readiness, and Model Metadata Test Suite.
"""

from fastapi.testclient import TestClient
import ml.predict as ml_module


def test_health_check_returns_ok(client: TestClient) -> None:
    """Verify GET /health returns 200 and expected service status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "insurance-claim-risk-scoring-api"
    assert "version" in data
    assert "timestamp" in data


def test_readiness_probe_success(client: TestClient) -> None:
    """Verify GET /ready reports ready when DB and ML are available."""
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database_ready"] is True
    assert data["model_ready"] is True


def test_readiness_probe_fails_when_model_unloaded(client: TestClient, monkeypatch) -> None:
    """Verify GET /ready returns 503 if model is not loaded."""
    monkeypatch.setattr("backend.app.api.health.is_ml_ready", lambda *args, **kwargs: False)

    response = client.get("/ready")
    assert response.status_code == 503
    data = response.json()["detail"]
    assert data["status"] == "not_ready"
    assert data["model_ready"] is False


def test_model_info_returns_expected_metadata(client: TestClient) -> None:
    """Verify GET /model-info returns required metadata and expected feature schema."""
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "1.0.0"
    assert isinstance(data["expected_features"], list)
    assert len(data["expected_features"]) > 0
    assert "Make" in data["expected_features"]
    assert "risk_thresholds" in data
    assert data["risk_thresholds"]["high_threshold"] > 0
