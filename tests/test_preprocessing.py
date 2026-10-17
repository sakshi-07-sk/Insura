"""Unit tests for preprocessing and data cleaning pipeline."""

import numpy as np
import pandas as pd
import pytest

from backend.training.preprocess import (
    DEFAULT_EXCLUDE_COLUMNS,
    build_preprocessor,
    clean_raw_data,
    create_train_val_test_splits,
    split_features_target,
    standardize_target,
)


def test_clean_raw_data_handles_anomalies(synthetic_claims_df):
    """Test that zero age and '0' month/day anomalies are converted to NaN for imputation."""
    cleaned = clean_raw_data(synthetic_claims_df)
    assert np.isnan(cleaned["Age"].iloc[0])
    assert pd.isna(cleaned["MonthClaimed"].iloc[1])
    assert pd.isna(cleaned["DayOfWeekClaimed"].iloc[1])


def test_standardize_target_binary_numeric():
    """Test standard 0 and 1 integer target."""
    s = pd.Series([0, 1, 0, 1])
    y, mapping = standardize_target(s, "target")
    assert list(y) == [0, 1, 0, 1]
    assert mapping["1"] == 1


def test_standardize_target_string_labels():
    """Test conversion of string targets like 'Y'/'N'."""
    s = pd.Series(["N", "Y", "N", "Y"])
    y, mapping = standardize_target(s, "target")
    assert list(y) == [0, 1, 0, 1]
    assert mapping["Y"] == 1


def test_standardize_target_invalid_labels():
    """Test that non-binary or multi-class targets raise ValueError."""
    with pytest.raises(ValueError, match="at least 2 classes"):
        standardize_target(pd.Series([1, 1, 1]), "target")

    with pytest.raises(ValueError, match="Unrecognized target labels"):
        standardize_target(pd.Series(["A", "B", "C"]), "target")


def test_split_features_target_missing_target(synthetic_claims_df):
    """Test that missing target column raises KeyError."""
    with pytest.raises(KeyError, match="Target column 'non_existent' not found"):
        split_features_target(synthetic_claims_df, target_col="non_existent")


def test_split_features_target_excludes_columns(synthetic_claims_df):
    """Test that identifier and protected columns are excluded from training features."""
    X, y, num_cols, cat_cols, mapping = split_features_target(
        synthetic_claims_df, target_col="FraudFound_P"
    )

    for excluded in DEFAULT_EXCLUDE_COLUMNS:
        assert excluded not in X.columns
    assert "FraudFound_P" not in X.columns
    assert len(X) == len(synthetic_claims_df)
    assert len(y) == len(synthetic_claims_df)


def test_preprocessor_handles_missing_and_unseen_values(synthetic_claims_df):
    """Test that ColumnTransformer imputes missing values and ignores unseen categories."""
    X, y, num_cols, cat_cols, _ = split_features_target(synthetic_claims_df)
    preprocessor = build_preprocessor(num_cols, cat_cols)
    preprocessor.fit(X)

    # Create test data with missing numeric, missing categorical, and unseen category
    test_data = X.iloc[:2].copy()
    test_data[num_cols[0]] = np.nan
    test_data[cat_cols[0]] = np.nan
    test_data["Make"] = "UnseenBrand99"

    transformed = preprocessor.transform(test_data)
    assert not np.isnan(transformed).any()
    assert transformed.shape[0] == 2
    assert transformed.shape[1] == len(preprocessor.get_feature_names_out())


def test_train_val_test_splits_stratification(synthetic_claims_df):
    """Test that train/val/test splits maintain stratified fraud proportions."""
    X, y, _, _, _ = split_features_target(synthetic_claims_df)
    X_tr, y_tr, X_val, y_val, X_te, y_te = create_train_val_test_splits(
        X, y, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, random_state=42
    )

    assert len(X_tr) + len(X_val) + len(X_te) == len(X)
    # Validate stratified class distribution is approximately equal
    orig_rate = np.mean(y)
    assert abs(np.mean(y_tr) - orig_rate) < 0.05
    assert abs(np.mean(y_val) - orig_rate) < 0.05
    assert abs(np.mean(y_te) - orig_rate) < 0.05
