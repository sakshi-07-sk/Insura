"""
Scoring Service Module.

Coordinates with Member 1's ML module, evaluates calibrated risk thresholds,
and formats unified risk scoring responses.
"""

import logging
from typing import Any, Dict
from backend.app.config import settings
from backend.app.schemas import RiskCategory, ReviewStatus, RISK_DISCLAIMER
from ml.predict import (
    score_claim as ml_score_claim,
    get_model_info as ml_get_model_info,
    is_model_ready as ml_is_model_ready,
    ModelNotLoadedError,
    InvalidFeatureError,
    PredictionError,
)

logger = logging.getLogger("insurance_api.scoring_service")


def get_risk_thresholds() -> tuple[float, float]:
    """Retrieve calibrated risk thresholds from metadata.json or settings fallback."""
    try:
        meta = ml_get_model_info()
        if meta and "selected_threshold" in meta:
            high_thresh = float(meta["selected_threshold"])
            low_thresh = round(high_thresh * 0.70, 4)
            return low_thresh, high_thresh
    except Exception as exc:
        logger.warning("Could not read threshold from metadata: %s. Using settings fallback.", exc)
    return settings.RISK_THRESHOLD_LOW, settings.RISK_THRESHOLD_HIGH


def evaluate_risk_category(fraud_probability: float) -> tuple[RiskCategory, bool, str]:
    """
    Categorize risk tier and generate review recommendation from probability.

    Returns:
        tuple[RiskCategory, requires_human_review, operational_message]
    """
    threshold_low, threshold_high = get_risk_thresholds()
    if fraud_probability < threshold_low:
        return (
            RiskCategory.LOW,
            False,
            "Low model-estimated risk. Eligible for expedited processing.",
        )
    elif fraud_probability < threshold_high:
        return (
            RiskCategory.MEDIUM,
            True,
            "Moderate model-estimated risk. Standard human review recommended.",
        )
    else:
        return (
            RiskCategory.HIGH,
            True,
            "Elevated model-estimated risk. Priority human investigation recommended.",
        )


def score_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute scoring on feature dictionary using the shared ML inference module.

    Raises:
        ModelNotLoadedError
        InvalidFeatureError
        PredictionError
    """
    logger.debug("Dispatching features to ML inference engine")
    raw_result = ml_score_claim(features)

    fraud_probability = float(raw_result["fraud_probability"])
    risk_score = float(raw_result.get("risk_score", round(fraud_probability * 100.0, 2)))
    model_version = str(raw_result.get("model_version", "1.0.0"))

    risk_category, requires_human_review, message = evaluate_risk_category(fraud_probability)

    return {
        "fraud_probability": fraud_probability,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "model_version": model_version,
        "requires_human_review": requires_human_review,
        "status": ReviewStatus.PENDING_REVIEW,
        "message": message,
        "disclaimer": RISK_DISCLAIMER,
    }


def get_ml_status() -> Dict[str, Any]:
    """Retrieve runtime ML model state."""
    return ml_get_model_info()


def is_ml_ready() -> bool:
    """Check whether ML scoring is operational."""
    return ml_is_model_ready()
