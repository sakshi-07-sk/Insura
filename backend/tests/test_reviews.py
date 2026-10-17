"""
Automated Test Suite for Investigation Review Workflow and Dashboard Analytics.
"""

from fastapi.testclient import TestClient
from backend.app.config import settings


def test_update_claim_review_lifecycle(client: TestClient, sample_valid_features: dict) -> None:
    """Verify reviewer can progress claim through review lifecycle without altering model metrics."""
    create_payload = {
        "claim_id": "CLM-REVIEW-TEST-01",
        "features": sample_valid_features,
    }
    create_res = client.post("/claims", json=create_payload)
    assert create_res.status_code == 201
    initial_score = create_res.json()["risk_score"]
    initial_prob = create_res.json()["fraud_probability"]

    # Step 1: Move to UNDER_REVIEW
    update_payload = {
        "review_status": "UNDER_REVIEW",
        "reviewer_id": "adjuster_marcus",
        "review_notes": "Assigned for verification of repair estimate.",
    }
    patch_res = client.patch("/claims/CLM-REVIEW-TEST-01/review", json=update_payload)
    assert patch_res.status_code == 200
    updated_data = patch_res.json()

    assert updated_data["review_status"] == "UNDER_REVIEW"
    assert updated_data["reviewed_by"] == "adjuster_marcus"
    assert updated_data["review_notes"] == "Assigned for verification of repair estimate."
    # Ensure model-generated fields are completely protected
    assert updated_data["risk_score"] == initial_score
    assert updated_data["fraud_probability"] == initial_prob

    # Step 2: Mark CLEARED
    clear_payload = {
        "review_status": "CLEARED",
        "reviewer_id": "adjuster_marcus",
        "review_notes": "All estimates verified. Approved for fast-track payout.",
    }
    patch_res2 = client.patch("/claims/CLM-REVIEW-TEST-01/review", json=clear_payload)
    assert patch_res2.status_code == 200
    assert patch_res2.json()["review_status"] == "CLEARED"


def test_update_review_nonexistent_claim_returns_404(client: TestClient) -> None:
    """Verify review update fails with 404 for nonexistent claim ID."""
    payload = {
        "review_status": "CLEARED",
        "reviewer_id": "adjuster_marcus",
    }
    response = client.patch("/claims/CLM-NONEXISTENT/review", json=payload)
    assert response.status_code == 404


def test_dashboard_statistics_calculation(
    client: TestClient,
    sample_valid_features: dict,
    sample_high_risk_features: dict,
) -> None:
    """Verify GET /dashboard/stats computes accurate metrics from stored records."""
    # Seed 2 claims: one lower risk, one high risk
    client.post("/claims", json={"claim_id": "CLM-STAT-01", "features": sample_valid_features})
    client.post("/claims", json={"claim_id": "CLM-STAT-02", "features": sample_high_risk_features})

    # Clear one claim
    client.patch(
        "/claims/CLM-STAT-01/review",
        json={"review_status": "CLEARED", "reviewer_id": "adjuster_jen"},
    )

    response = client.get("/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()

    assert stats["total_claims"] == 2
    assert "risk_category_counts" in stats
    assert stats["risk_category_counts"]["LOW"] >= 1
    assert stats["cleared_claims"] == 1
    assert stats["claims_awaiting_review"] == 1
    assert isinstance(stats["average_risk_score"], float)
    assert stats["average_risk_score"] > 0.0


def test_reviewer_authentication_enforcement(client: TestClient, sample_valid_features: dict) -> None:
    """Verify API rejects unauthorized reviewer updates when REQUIRE_AUTH is true."""
    settings.REQUIRE_AUTH = True

    try:
        client.post("/claims", json={"claim_id": "CLM-AUTH-TEST", "features": sample_valid_features})

        payload = {
            "review_status": "ESCALATED",
            "reviewer_id": "fraud_specialist",
        }

        # Request missing auth header -> 401
        res_no_auth = client.patch("/claims/CLM-AUTH-TEST/review", json=payload)
        assert res_no_auth.status_code == 401

        # Request with invalid auth key -> 403
        res_bad_auth = client.patch(
            "/claims/CLM-AUTH-TEST/review",
            json=payload,
            headers={"X-API-Key": "wrong-key"},
        )
        assert res_bad_auth.status_code == 403

        # Request with correct auth key -> 200
        res_ok_auth = client.patch(
            "/claims/CLM-AUTH-TEST/review",
            json=payload,
            headers={"X-API-Key": settings.API_KEY},
        )
        assert res_ok_auth.status_code == 200
        assert res_ok_auth.json()["review_status"] == "ESCALATED"
    finally:
        settings.REQUIRE_AUTH = False
