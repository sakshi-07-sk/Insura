"""Reusable Preprocessing Pipeline for Insurance Claim Fraud Risk Scoring.

Provides robust utilities for data cleaning, column segregation, leakage prevention,
imputation, encoding, and reproducible stratified train/validation/test splitting.
"""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Default columns to exclude from training features:
# - PolicyNumber: Unique identifier, causes memorization / false correlation
# - RepNumber: Internal claim representative ID, operational assignment
# - Protected attributes (Sex, MaritalStatus): Excluded by default for algorithmic fairness & ethical insurance safeguards
DEFAULT_EXCLUDE_COLUMNS = [
    "PolicyNumber",
    "RepNumber",
    "Sex",
    "MaritalStatus",
]


def clean_raw_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans domain anomalies in the insurance dataset without dropping records.

    Handles:
    - Age == 0: Converted to NaN so median imputer can estimate a realistic driver age.
    - MonthClaimed == '0': Converted to NaN for categorical mode imputation.
    - DayOfWeekClaimed == '0': Converted to NaN for categorical mode imputation.

    Parameters
    ----------
    df : pd.DataFrame
        Raw claims dataframe.

    Returns
    -------
    pd.DataFrame
        Cleaned dataframe copy.
    """
    df_clean = df.copy()

    # Driver/Claimant Age 0 anomaly
    if "Age" in df_clean.columns:
        df_clean["Age"] = df_clean["Age"].replace(0, np.nan)

    # Date anomaly where '0' was recorded instead of month/day
    if "MonthClaimed" in df_clean.columns:
        df_clean["MonthClaimed"] = df_clean["MonthClaimed"].astype(str).replace({"0": np.nan, "0.0": np.nan})

    if "DayOfWeekClaimed" in df_clean.columns:
        df_clean["DayOfWeekClaimed"] = df_clean["DayOfWeekClaimed"].astype(str).replace({"0": np.nan, "0.0": np.nan})

    return df_clean


def standardize_target(
    y_raw: pd.Series, target_col: str = "FraudFound_P"
) -> Tuple[pd.Series, Dict[str, int]]:
    """Validates and standardizes the target column into binary {0, 1}.

    Parameters
    ----------
    y_raw : pd.Series
        Raw target series.
    target_col : str
        Target column name.

    Returns
    -------
    tuple of (pd.Series, dict)
        Standardized binary series (0 = genuine, 1 = fraud) and label mapping.
    """
    unique_vals = set(y_raw.dropna().unique())

    if len(unique_vals) < 2:
        raise ValueError(
            f"Target column '{target_col}' must contain at least 2 classes. Found: {unique_vals}"
        )

    # Standard numeric target {0, 1}
    if unique_vals == {0, 1} or unique_vals == {0.0, 1.0}:
        y = y_raw.astype(int)
        mapping = {"0": 0, "1": 1}
        return y, mapping

    # String target e.g. {'N', 'Y'} or {'No', 'Yes'}
    str_vals = {str(v).strip().lower() for v in unique_vals}
    if str_vals in [{"n", "y"}, {"no", "yes"}, {"false", "true"}, {"0", "1"}]:
        mapping_dict = {}
        for val in unique_vals:
            s = str(val).strip().lower()
            if s in ["y", "yes", "true", "1"]:
                mapping_dict[val] = 1
            else:
                mapping_dict[val] = 0
        y = y_raw.map(mapping_dict).astype(int)
        str_mapping = {str(k): int(v) for k, v in mapping_dict.items()}
        return y, str_mapping

    raise ValueError(
        f"Unrecognized target labels in column '{target_col}': {unique_vals}. "
        "Expected binary {0, 1}, {'N', 'Y'}, or {'No', 'Yes'}."
    )


def split_features_target(
    df: pd.DataFrame,
    target_col: str = "FraudFound_P",
    exclude_cols: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, pd.Series, List[str], List[str], Dict[str, int]]:
    """Separates features and target, excluding identifiers, protected attributes,

    and leakage candidates.

    Parameters
    ----------
    df : pd.DataFrame
        Input dataframe.
    target_col : str
        Name of target column.
    exclude_cols : list of str, optional
        Additional columns to exclude from features.

    Returns
    -------
    tuple
        (X, y, numeric_features, categorical_features, label_mapping)
    """
    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in dataframe.")

    df_cleaned = clean_raw_data(df)

    # Standardize target
    y, label_mapping = standardize_target(df_cleaned[target_col], target_col=target_col)

    # Exclude columns
    to_exclude = set(DEFAULT_EXCLUDE_COLUMNS)
    if exclude_cols:
        to_exclude.update(exclude_cols)
    to_exclude.add(target_col)

    feature_cols = [c for c in df_cleaned.columns if c not in to_exclude]
    X = df_cleaned[feature_cols].copy()

    # Identify numeric and categorical columns
    numeric_features = [c for c in feature_cols if pd.api.types.is_numeric_dtype(X[c])]
    categorical_features = [c for c in feature_cols if not pd.api.types.is_numeric_dtype(X[c])]

    return X, y, numeric_features, categorical_features, label_mapping


def build_preprocessor(
    numeric_features: List[str], categorical_features: List[str]
) -> ColumnTransformer:
    """Builds a scikit-learn ColumnTransformer for numeric and categorical features.

    - Numeric: Median imputation -> StandardScaler
    - Categorical: Mode imputation -> OneHotEncoder(handle_unknown='ignore', sparse_output=False)

    Parameters
    ----------
    numeric_features : list of str
        List of numeric column names.
    categorical_features : list of str
        List of categorical column names.

    Returns
    -------
    ColumnTransformer
        Configured, unfitted ColumnTransformer.
    """
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "onehot",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                    dtype=np.float32,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
        verbose_feature_names_out=True,
    )

    return preprocessor


def create_train_val_test_splits(
    X: pd.DataFrame,
    y: pd.Series,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
    """Splits data into stratified train, validation, and test sets.

    Parameters
    ----------
    X : pd.DataFrame
        Features dataframe.
    y : pd.Series
        Target labels.
    train_ratio : float
        Proportion for training (default 0.70).
    val_ratio : float
        Proportion for validation (default 0.15).
    test_ratio : float
        Proportion for testing (default 0.15).
    random_state : int
        Seed for reproducibility.

    Returns
    -------
    tuple
        (X_train, y_train, X_val, y_val, X_test, y_test)
    """
    total = train_ratio + val_ratio + test_ratio
    if not np.isclose(total, 1.0):
        raise ValueError(f"Split ratios must sum to 1.0, got: {total}")

    # First split: Train vs (Val + Test)
    temp_ratio = val_ratio + test_ratio
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=temp_ratio,
        random_state=random_state,
        stratify=y,
    )

    # Second split: Val vs Test
    val_fraction_of_temp = val_ratio / temp_ratio
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=(1.0 - val_fraction_of_temp),
        random_state=random_state,
        stratify=y_temp,
    )

    return X_train, y_train, X_val, y_val, X_test, y_test
