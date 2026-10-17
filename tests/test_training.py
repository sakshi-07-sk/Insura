"""Unit tests for training, model selection, threshold calibration, and serialization."""

import json
import os
import tempfile
import numpy as np
import pandas as pd
import pytest

from backend.training.train_model import train_and_evaluate_pipeline


def test_train_pipeline_synthetic_execution(synthetic_claims_df, tmp_path):
    """Test full training pipeline execution on synthetic data with artifact generation."""
    data_file = tmp_path / "synthetic_claims.csv"
    synthetic_claims_df.to_csv(data_file, index=False)

    model_dir = tmp_path / "models"
    reports_dir = tmp_path / "reports"

    metrics_result = train_and_evaluate_pipeline(
        data_path=str(data_file),
        target_col="FraudFound_P",
        model_dir=str(model_dir),
        reports_dir=str(reports_dir),
        random_state=42,
        min_recall=0.30,
    )

    # Verify return structure
    assert "model_name" in metrics_result
    assert "selected_threshold" in metrics_result
    assert "test_metrics_selected_threshold" in metrics_result

    # Verify saved artifacts
    assert os.path.exists(model_dir / "risk_model.joblib")
    assert os.path.exists(model_dir / "metadata.json")
    assert os.path.exists(model_dir / "metrics.json")
    assert os.path.exists(model_dir / "feature_importance.json")

    # Verify metadata contents
    with open(model_dir / "metadata.json") as f:
        meta = json.load(f)
        assert meta["model_version"] == "1.0.0"
        assert meta["target_column"] == "FraudFound_P"
        assert len(meta["features"]["numeric_features"]) > 0
        assert len(meta["features"]["categorical_features"]) > 0

    # Verify figures created
    assert os.path.exists(reports_dir / "figures" / "pr_curve.png")
    assert os.path.exists(reports_dir / "figures" / "roc_curve.png")
    assert os.path.exists(reports_dir / "figures" / "confusion_matrix.png")


def test_training_reproducibility(synthetic_claims_df, tmp_path):
    """Test that two runs with identical seeds produce identical test metrics."""
    data_file = tmp_path / "claims.csv"
    synthetic_claims_df.to_csv(data_file, index=False)

    run1 = train_and_evaluate_pipeline(
        data_path=str(data_file),
        model_dir=str(tmp_path / "m1"),
        reports_dir=str(tmp_path / "r1"),
        random_state=42,
    )
    run2 = train_and_evaluate_pipeline(
        data_path=str(data_file),
        model_dir=str(tmp_path / "m2"),
        reports_dir=str(tmp_path / "r2"),
        random_state=42,
    )

    assert run1["model_name"] == run2["model_name"]
    assert run1["selected_threshold"] == run2["selected_threshold"]
    assert (
        run1["test_metrics_selected_threshold"]["roc_auc"]
        == run2["test_metrics_selected_threshold"]["roc_auc"]
    )
