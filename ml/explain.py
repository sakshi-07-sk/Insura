"""Lightweight, Responsible Model Explainability for Insurance Claim Risk Scoring.

Provides global feature importances and per-claim risk factor attributions
without requiring heavy external dependencies (guaranteeing IBM LinuxONE s390x compatibility).
Includes strict responsible AI caveats.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

EXPLANATION_CAVEAT = (
    "NOTICE: Risk scores and feature contributions represent statistical associations derived "
    "from historical claim patterns and do not constitute proof of fraud or causation. "
    "High-risk flags are decision-support indicators designed solely to prioritize human investigator review."
)


def get_global_feature_importances(
    pipeline: Any, top_n: int = 15
) -> List[Dict[str, Any]]:
    """Extracts top global feature importances from the fitted pipeline.

    Parameters
    ----------
    pipeline : sklearn.pipeline.Pipeline
        Fitted model pipeline containing 'preprocessor' and 'classifier'.
    top_n : int
        Number of top features to return.

    Returns
    -------
    list of dict
        Sorted list of feature dictionaries with name, importance score, and source.
    """
    try:
        clf = pipeline.named_steps["classifier"]
        preprocessor = pipeline.named_steps["preprocessor"]
        feature_names = preprocessor.get_feature_names_out().tolist()

        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
        elif hasattr(clf, "coef_"):
            importances = np.abs(clf.coef_[0])
        elif hasattr(clf, "calibrated_classifiers_"):
            base = getattr(clf.calibrated_classifiers_[0], "estimator", getattr(clf.calibrated_classifiers_[0], "base_estimator", None))
            if hasattr(base, "feature_importances_"):
                importances = base.feature_importances_
            elif hasattr(base, "coef_"):
                importances = np.abs(base.coef_[0])
            else:
                return []
        else:
            return []

        indices = np.argsort(importances)[::-1][:top_n]
        results = []
        for idx in indices:
            raw_name = feature_names[idx]
            clean_name = raw_name.replace("cat__", "").replace("num__", "")
            results.append({
                "feature": clean_name,
                "importance": round(float(importances[idx]), 6),
                "encoded_feature": raw_name,
            })
        return results
    except Exception as e:
        return [{"error": f"Could not extract feature importances: {str(e)}"}]


def explain_single_claim(
    pipeline: Any,
    claim_df: pd.DataFrame,
    predicted_probability: float,
    threshold: float,
    top_k: int = 5,
) -> Dict[str, Any]:
    """Generates an honest, interpretable per-claim risk explanation.

    Identifies which features in this specific claim are active and how strongly
    they align with the model's global risk indicators.

    Parameters
    ----------
    pipeline : sklearn.pipeline.Pipeline
        Fitted pipeline.
    claim_df : pd.DataFrame
        Single-row dataframe matching the training schema.
    predicted_probability : float
        Model estimated fraud probability (0 to 1).
    threshold : float
        Decision threshold applied.
    top_k : int
        Number of top contributing factors to highlight.

    Returns
    -------
    dict
        Structured explanation with summary, risk factors, and ethical caveats.
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    clf = pipeline.named_steps["classifier"]

    # Transform the single row
    transformed_row = preprocessor.transform(claim_df)[0]
    feature_names = preprocessor.get_feature_names_out()

    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        importances = clf.coef_[0]
    elif hasattr(clf, "calibrated_classifiers_"):
        base = getattr(clf.calibrated_classifiers_[0], "estimator", getattr(clf.calibrated_classifiers_[0], "base_estimator", None))
        if hasattr(base, "feature_importances_"):
            importances = base.feature_importances_
        elif hasattr(base, "coef_"):
            importances = base.coef_[0]
        else:
            importances = np.ones(len(feature_names))
    else:
        importances = np.ones(len(feature_names))

    # Identify active features (non-zero in transformed row)
    active_indices = np.where(transformed_row != 0)[0]
    scored_features = []

    for idx in active_indices:
        feat_name = feature_names[idx]
        val = transformed_row[idx]
        imp = importances[idx]

        # Determine the original column name and value
        clean_name = feat_name.replace("cat__", "").replace("num__", "")
        col_parts = clean_name.split("_", 1)
        orig_col = col_parts[0] if len(col_parts) > 1 else clean_name

        orig_val = claim_df[orig_col].iloc[0] if orig_col in claim_df.columns else "Active"

        scored_features.append({
            "feature": orig_col,
            "encoded_name": clean_name,
            "value": str(orig_val),
            "weight": float(imp * abs(val)),
            "importance": float(imp),
        })

    # Sort active features by magnitude of weight
    scored_features.sort(key=lambda x: x["weight"], reverse=True)
    top_factors = scored_features[:top_k]

    # Formulate factors and descriptions
    risk_factors = []
    for item in top_factors:
        is_high_risk = predicted_probability >= threshold
        direction = "INCREASES_RISK" if is_high_risk else "DECREASES_RISK"
        description = (
            f"Feature '{item['feature']}' with value '{item['value']}' "
            f"is a strong statistical indicator in historical claim triage."
        )
        risk_factors.append({
            "feature": item["feature"],
            "value": item["value"],
            "contribution_direction": direction,
            "importance_weight": round(item["importance"], 4),
            "description": description,
        })

    # Summary text
    risk_score = round(predicted_probability * 100, 1)
    if predicted_probability >= threshold:
        summary = (
            f"Model-estimated risk score is {risk_score}/100, exceeding the investigation "
            f"threshold of {round(threshold * 100, 1)}. Recommended action: prioritize for manual human audit."
        )
    elif predicted_probability >= (threshold * 0.7):
        summary = (
            f"Model-estimated risk score is {risk_score}/100 (MEDIUM risk). "
            f"Standard processing with automated verification checks is recommended."
        )
    else:
        summary = (
            f"Model-estimated risk score is {risk_score}/100 (LOW risk). "
            f"Eligible for expedited straight-through payout processing."
        )

    return {
        "summary": summary,
        "risk_factors": risk_factors,
        "caveat": EXPLANATION_CAVEAT,
    }
