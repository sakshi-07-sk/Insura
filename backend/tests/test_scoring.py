"""
Automated Test Suite for Real-Time Claim Scoring.
"""

from fastapi.testclient import TestClient
import ml.predict as ml_module


def test_score_valid_claim_returns_agreed_schema(client: TestClient, sample_valid_features: dict) -> None:
    """Verify POST /claims/score processes valid features and produces standard schema."""
    payload = {
        "claim_id": "TEST-CLAIM-001",
        "features": sample_valid_features,
        "notes": "Automated unit test claim",
        "persist": True,
    }

    response = client.post("/claims/score", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["claim_id"] == "TEST-CLAIM-001"
    assert isinstance(data["fraud_probability"], float)
    assert 0.0 <= data["fraud_probability"] <= 1.0
    assert isinstance(data["risk_score"], float)
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_category"] in ["LOW", "MEDIUM", "HIGH"]
    assert isinstance(data["requires_human_review"], bool)
    assert data["status"] == "PENDING_REVIEW"
    assert "disclaimer" in data
    assert "NOTICE" in data["disclaimer"]


def test_score_high_risk_claim_triggers_human_review(client: TestClient, sample_high_risk_features: dict) -> None:
    """Verify high-risk synthetic claim triggers human review requirement."""
    payload = {
        "claim_id": "TEST-CLAIM-HIGH",
        "features": sample_high_risk_features,
        "persist": False,
    }

    response = client.post("/claims/score", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["risk_category"] == "HIGH"
    assert data["requires_human_review"] is True
    assert data["risk_score"] >= 50.0


def test_scoring_fails_on_missing_required_features(client: TestClient, sample_valid_features: dict) -> None:
    """Verify missing required ML features are rejected with 422 error."""
    incomplete_features = sample_valid_features.copy()
    del incomplete_features["Make"]

    payload = {
        "features": incomplete_features,
    }

    response = client.post("/claims/score", json=payload)
    assert response.status_code == 422


def test_scoring_fails_on_unexpected_extra_features(client: TestClient, sample_valid_features: dict) -> None:
    """Verify arbitrary undeclared features are rejected with 422 error."""
    extra_features = sample_valid_features.copy()
    extra_features["arbitrary_injected_field"] = "malicious_payload"

    payload = {
        "features": extra_features,
    }

    response = client.post("/claims/score", json=payload)
    assert response.status_code == 422


def test_scoring_fails_on_invalid_numeric_values(client: TestClient, sample_valid_features: dict) -> None:
    """Verify non-numeric or negative values fail validation."""
    invalid_features = sample_valid_features.copy()
    invalid_features["Age"] = -50.0

    payload = {
        "features": invalid_features,
    }

    response = client.post("/claims/score", json=payload)
    assert response.status_code == 422


def test_scoring_fails_safely_when_model_unavailable(client: TestClient, sample_valid_features: dict, monkeypatch) -> None:
    """Verify API returns 503 rather than fabricating risk scores when ML model is unavailable."""
    def raise_unloaded(*args, **kwargs):
        raise ml_module.ModelNotLoadedError("Model artifact unavailable.")

    monkeypatch.setattr("backend.app.services.scoring_service.ml_score_claim", raise_unloaded)

    payload = {
        "features": sample_valid_features,
    }
    response = client.post("/claims/score", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert data["error_type"] == "ModelNotLoadedError"
