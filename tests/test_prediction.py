"""Unit tests for inference module, input validation, schemas, and scoring behavior."""

import math
import pytest

from ml.predict import get_model_info, load_model, score_claim, score_claims, validate_claim
from ml.schemas import RiskScoreResponse


def test_load_model_and_metadata():
    """Test that model pipeline and metadata are successfully loaded from disk."""
    model, metadata = load_model()
    assert model is not None
    assert metadata is not None
    assert "model_version" in metadata
    assert "selected_threshold" in metadata


def test_get_model_info():
    """Test retrieving active model configuration and schema."""
    info = get_model_info()
    assert info["model_version"] == "1.0.0"
    assert info["model_type"] in ["RandomForest", "LogisticRegression", "HistGradientBoosting"]
    assert "features" in info


def test_score_valid_claim(sample_valid_claim):
    """Test scoring a valid claim payload produces compliant schema and ranges."""
    res = score_claim(sample_valid_claim)

    assert 0.0 <= res["risk_score"] <= 100.0
    assert 0.0 <= res["fraud_probability"] <= 1.0
    assert res["risk_category"] in ["LOW", "MEDIUM", "HIGH"]
    assert isinstance(res["requires_human_review"], bool)
    assert len(res["explanation"]) > 0
    assert isinstance(res["top_risk_factors"], list)

    # Verify Pydantic schema compliance
    validated_obj = RiskScoreResponse(**res)
    assert validated_obj.model_version == res["model_version"]


def test_score_claim_validation_empty_input():
    """Test that empty dictionary raises ValueError."""
    with pytest.raises(ValueError, match="non-empty dictionary"):
        score_claim({})


def test_score_claim_validation_nan_inf():
    """Test that NaN and Infinity raise ValueError."""
    with pytest.raises(ValueError, match="NaN or Infinity"):
        validate_claim({"Age": float("nan")})

    with pytest.raises(ValueError, match="NaN or Infinity"):
        validate_claim({"Age": float("inf")})


def test_score_claim_validation_none_null():
    """Test that None/null values raise ValueError."""
    with pytest.raises(ValueError, match="null value"):
        validate_claim({"Age": None})


def test_score_claim_missing_features_enforcement(sample_valid_claim):
    """Test that omitting required features raises ValueError unless explicitly allowed."""
    incomplete_claim = sample_valid_claim.copy()
    del incomplete_claim["Month"]

    with pytest.raises(ValueError, match="Missing 1 required claim feature"):
        score_claim(incomplete_claim, allow_missing_features=False)

    # When allow_missing_features=True, imputer fills the gap cleanly
    res = score_claim(incomplete_claim, allow_missing_features=True)
    assert 0.0 <= res["risk_score"] <= 100.0


def test_score_claims_batch(sample_valid_claim):
    """Test batch scoring endpoint function."""
    claims = [sample_valid_claim, sample_valid_claim]
    batch_res = score_claims(claims)

    assert batch_res["total_claims"] == 2
    assert (
        batch_res["high_risk_count"]
        + batch_res["medium_risk_count"]
        + batch_res["low_risk_count"]
        == 2
    )
    assert len(batch_res["results"]) == 2
