"""
Automated Test Suite for Claim Lifecycle and Retrieval.
"""

from fastapi.testclient import TestClient


def test_create_claim_success(client: TestClient, sample_valid_features: dict) -> None:
    """Verify POST /claims creates and persists a new claim record."""
    payload = {
        "claim_id": "CLM-PERSIST-101",
        "external_reference": "EXT-POLICY-99",
        "features": sample_valid_features,
        "notes": "Direct submission test",
    }

    response = client.post("/claims", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["claim_id"] == "CLM-PERSIST-101"
    assert data["external_reference"] == "EXT-POLICY-99"
    assert data["review_status"] == "PENDING_REVIEW"
    assert data["fraud_probability"] >= 0.0


def test_create_duplicate_claim_fails(client: TestClient, sample_valid_features: dict) -> None:
    """Verify duplicate claim ID submission returns 409 Conflict."""
    payload = {
        "claim_id": "CLM-DUPLICATE-ID",
        "features": sample_valid_features,
    }

    res1 = client.post("/claims", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/claims", json=payload)
    assert res2.status_code == 409


def test_get_claim_by_id_success(client: TestClient, sample_valid_features: dict) -> None:
    """Verify GET /claims/{claim_id} returns full stored claim record."""
    create_payload = {
        "claim_id": "CLM-RETRIEVE-202",
        "features": sample_valid_features,
    }
    client.post("/claims", json=create_payload)

    response = client.get("/claims/CLM-RETRIEVE-202")
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-RETRIEVE-202"
    assert "features" in data
    assert data["features"]["Make"] == "Honda"


def test_get_nonexistent_claim_returns_404(client: TestClient) -> None:
    """Verify GET /claims/{claim_id} returns 404 for unknown claim."""
    response = client.get("/claims/CLM-DOES-NOT-EXIST")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_claims_pagination_and_filters(
    client: TestClient,
    sample_valid_features: dict,
    sample_high_risk_features: dict,
) -> None:
    """Verify GET /claims pagination and category filtering."""
    # Seed claims
    client.post("/claims", json={"claim_id": "CLM-BATCH-01", "features": sample_valid_features})
    client.post("/claims", json={"claim_id": "CLM-BATCH-02", "features": sample_high_risk_features})

    # Test pagination
    response = client.get("/claims?page=1&page_size=1")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert len(data["claims"]) == 1

    # Test filtering by risk category LOW
    low_res = client.get("/claims?risk_category=LOW")
    assert low_res.status_code == 200
    low_data = low_res.json()
    assert low_data["total"] >= 1
    for claim in low_data["claims"]:
        assert claim["risk_category"] == "LOW"
