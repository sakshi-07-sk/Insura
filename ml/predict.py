"""Production-ready Inference Module for Insurance Claim Fraud Risk Scoring.

Provides clean Python functions for loading serialized pipelines, validating claim schemas,
generating calibrated risk scores (0-100), assigning triage categories (LOW, MEDIUM, HIGH),
and providing lightweight explainability. Built for direct integration by Member 2 (FastAPI).
"""

import json
import math
import os
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd

from ml.explain import explain_single_claim, get_global_feature_importances

# Default relative paths to model artifacts
DEFAULT_MODEL_PATH = os.path.join(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/models")),
    "risk_model.joblib",
)
DEFAULT_METADATA_PATH = os.path.join(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/models")),
    "metadata.json",
)

# Exception classes for structured API error handling
class ModelNotLoadedError(FileNotFoundError, RuntimeError):
    """Raised when scoring is attempted while the model artifact is missing or not loaded."""


class InvalidFeatureError(ValueError):
    """Raised when claim input features fail schema validation."""


class PredictionError(RuntimeError):
    """Raised when an internal error occurs during model inference."""


# Global memory cache for loaded pipeline and metadata
_CACHED_MODEL = None
_CACHED_METADATA = None


def is_model_ready(model_path: Optional[str] = None) -> bool:
    """Checks whether the model pipeline is loaded or available on disk."""
    global _CACHED_MODEL
    if _CACHED_MODEL is not None:
        return True
    path = model_path or DEFAULT_MODEL_PATH
    return os.path.exists(path)


def load_model(
    model_path: Optional[str] = None,
    metadata_path: Optional[str] = None,
    artifact_path: Optional[str] = None,
    allow_mock: bool = False,
) -> Tuple[Any, Dict[str, Any]]:
    """Loads and caches the fitted scikit-learn pipeline and associated metadata.

    Parameters
    ----------
    model_path : str, optional
        Path to risk_model.joblib (default: backend/models/risk_model.joblib).
    metadata_path : str, optional
        Path to metadata.json (default: backend/models/metadata.json).
    artifact_path : str, optional
        Alias for model_path.
    allow_mock : bool, optional
        Whether to permit mock fallback if model artifact is missing.

    Returns
    -------
    tuple of (pipeline, metadata_dict)
    """
    global _CACHED_MODEL, _CACHED_METADATA

    resolved_model_path = model_path or artifact_path or DEFAULT_MODEL_PATH
    resolved_meta_path = metadata_path or DEFAULT_METADATA_PATH

    if _CACHED_MODEL is not None and _CACHED_METADATA is not None and model_path is None:
        return _CACHED_MODEL, _CACHED_METADATA

    if not os.path.exists(resolved_model_path):
        if allow_mock:
            return None, {}
        raise ModelNotLoadedError(
            f"Model artifact not found at: {resolved_model_path}. "
            "Please run 'python backend/training/train_model.py' first."
        )

    pipeline = joblib.load(resolved_model_path)

    metadata = {}
    if os.path.exists(resolved_meta_path):
        with open(resolved_meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

    if model_path is None:
        _CACHED_MODEL = pipeline
        _CACHED_METADATA = metadata

    return pipeline, metadata


def get_model_info(model_dir: Optional[str] = None) -> Dict[str, Any]:
    """Returns model metadata, versions, threshold policies, and required feature schema."""
    _, metadata = load_model()
    return metadata


def validate_claim(
    claim_data: Dict[str, Any],
    expected_features: Optional[List[str]] = None,
    allow_missing: bool = False,
) -> Dict[str, Any]:
    """Validates raw claim input dictionary before inference.

    Checks:
    - Empty payload rejection
    - Non-null values
    - NaN and infinity values in numerical fields
    - Missing required fields (if allow_missing=False)

    Parameters
    ----------
    claim_data : dict
        Key-value pairs of feature values.
    expected_features : list of str, optional
        List of required feature names from training metadata.
    allow_missing : bool
        If True, missing features are tolerated and left for imputer. If False, raises ValueError.

    Returns
    -------
    dict
        Cleaned, validated claim feature dictionary.
    """
    if not isinstance(claim_data, dict) or len(claim_data) == 0:
        raise ValueError("Claim input must be a non-empty dictionary.")

    for k, v in claim_data.items():
        if v is None:
            raise ValueError(f"Feature '{k}' contains a null value, which is not permitted at inference.")
        if isinstance(v, (float, int)):
            if math.isnan(v) or math.isinf(v):
                raise ValueError(f"Feature '{k}' contains an invalid numerical value (NaN or Infinity).")

    if expected_features is not None and not allow_missing:
        missing = [f for f in expected_features if f not in claim_data]
        if missing:
            raise ValueError(
                f"Missing {len(missing)} required claim feature(s): {missing[:5]}"
                + (f" and {len(missing)-5} more." if len(missing) > 5 else ".")
            )

    return claim_data


def score_claim(
    claim_data: Dict[str, Any],
    model: Optional[Any] = None,
    metadata: Optional[Dict[str, Any]] = None,
    threshold: Optional[float] = None,
    include_explanation: bool = True,
    allow_missing_features: bool = False,
) -> Dict[str, Any]:
    """Scores a single claim dictionary and returns risk score, category, and explanation.

    Parameters
    ----------
    claim_data : dict
        Dictionary of claim features.
    model : pipeline, optional
        Preloaded pipeline (loads cached default if None).
    metadata : dict, optional
        Preloaded metadata (loads cached default if None).
    threshold : float, optional
        Custom decision threshold (defaults to calibrated validation threshold in metadata).
    include_explanation : bool
        Whether to generate per-claim explanation and risk factors.
    allow_missing_features : bool
        Whether to allow pipeline imputer to handle missing features.

    Returns
    -------
    dict
        Standardized risk scoring result dictionary.
    """
    if model is None or metadata is None:
        loaded_model, loaded_meta = load_model()
        model = model or loaded_model
        metadata = metadata or loaded_meta

    feature_info = metadata.get("features", {})
    expected_features = feature_info.get("feature_schema", {})
    required_cols = list(expected_features.keys()) if expected_features else None

    # Validate claim input
    clean_claim = validate_claim(
        claim_data,
        expected_features=required_cols,
        allow_missing=allow_missing_features,
    )

    # Convert to single-row DataFrame aligned with training columns
    if required_cols:
        row_dict = {col: [clean_claim.get(col, np.nan)] for col in required_cols}
        claim_df = pd.DataFrame(row_dict)
    else:
        claim_df = pd.DataFrame([clean_claim])

    # Predict probability
    probs = model.predict_proba(claim_df)[0]
    # Class 1 is fraud
    fraud_prob = float(probs[1])
    risk_score = round(fraud_prob * 100.0, 1)

    # Determine threshold
    configured_threshold = float(metadata.get("selected_threshold", 0.61))
    active_threshold = float(threshold if threshold is not None else configured_threshold)

    # Classify Risk Tier
    # High: >= threshold
    # Medium: >= 0.70 * threshold
    # Low: < 0.70 * threshold
    medium_threshold = round(active_threshold * 0.70, 4)

    if fraud_prob >= active_threshold:
        risk_category = "HIGH"
        requires_review = True
    elif fraud_prob >= medium_threshold:
        risk_category = "MEDIUM"
        requires_review = False
    else:
        risk_category = "LOW"
        requires_review = False

    model_version = metadata.get("model_version", "1.0.0")

    # Generate Explainability
    if include_explanation:
        explanation_obj = explain_single_claim(
            pipeline=model,
            claim_df=claim_df,
            predicted_probability=fraud_prob,
            threshold=active_threshold,
            top_k=5,
        )
        explanation_text = explanation_obj["summary"]
        top_risk_factors = explanation_obj["risk_factors"]
    else:
        explanation_text = (
            f"Calibrated risk score: {risk_score}/100. Assigned category: {risk_category}."
        )
        top_risk_factors = []

    return {
        "risk_score": risk_score,
        "fraud_probability": round(fraud_prob, 4),
        "risk_category": risk_category,
        "model_version": model_version,
        "threshold_used": round(active_threshold, 4),
        "requires_human_review": requires_review,
        "explanation": explanation_text,
        "top_risk_factors": top_risk_factors,
    }


def score_claims(
    claims_list: List[Dict[str, Any]],
    model: Optional[Any] = None,
    metadata: Optional[Dict[str, Any]] = None,
    threshold: Optional[float] = None,
) -> Dict[str, Any]:
    """Scores a batch of claims and provides summary triage metrics."""
    if not isinstance(claims_list, list) or len(claims_list) == 0:
        raise ValueError("Input claims_list must be a non-empty list of claim dictionaries.")

    if model is None or metadata is None:
        loaded_model, loaded_meta = load_model()
        model = model or loaded_model
        metadata = metadata or loaded_meta

    results = []
    high_count = 0
    med_count = 0
    low_count = 0

    for claim in claims_list:
        score_res = score_claim(
            claim_data=claim,
            model=model,
            metadata=metadata,
            threshold=threshold,
            include_explanation=False,  # Omit detailed explanations for batch throughput
        )
        cat = score_res["risk_category"]
        if cat == "HIGH":
            high_count += 1
        elif cat == "MEDIUM":
            med_count += 1
        else:
            low_count += 1
        results.append(score_res)

    return {
        "total_claims": len(results),
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "results": results,
    }
