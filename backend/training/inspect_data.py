"""Dataset Inspection Script for Insurance Claim Risk Scoring.

Analyzes raw claim datasets, validates target columns, checks for missing data,
anomalies, identifier columns, and potential data leakage risks.
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd


def inspect_dataset(
    filepath: str,
    target_col: Optional[str] = "FraudFound_P",
    output_json: Optional[str] = None,
) -> Dict[str, Any]:
    """Inspects the specified CSV dataset and generates a comprehensive data health report.

    Parameters
    ----------
    filepath : str
        Path to the CSV dataset.
    target_col : str, optional
        Name of the target column to validate (default 'FraudFound_P').
    output_json : str, optional
        Optional path to save report as JSON.

    Returns
    -------
    dict
        Structured dictionary containing inspection results.
    """
    if not os.path.exists(filepath):
        print(f"[ERROR] Dataset file not found at: {filepath}", file=sys.stderr)
        sys.exit(1)

    print(f"\n========================================================")
    print(f"  INSURANCE CLAIM DATASET INSPECTION REPORT")
    print(f"  File: {filepath}")
    print(f"========================================================\n")

    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"[ERROR] Failed to read CSV file: {e}", file=sys.stderr)
        sys.exit(1)

    n_rows, n_cols = df.shape
    print(f"[*] Dataset Shape: {n_rows:,} rows, {n_cols} columns")

    # 1. Target Column Validation
    target_info: Dict[str, Any] = {"column": target_col, "found": False}
    if target_col and target_col in df.columns:
        target_info["found"] = True
        vc = df[target_col].value_counts(dropna=False).to_dict()
        vc_pct = (df[target_col].value_counts(normalize=True, dropna=False) * 100).to_dict()
        target_info["value_counts"] = {str(k): int(v) for k, v in vc.items()}
        target_info["distribution_percent"] = {str(k): round(float(v), 2) for k, v in vc_pct.items()}
        target_info["unique_values"] = [str(x) for x in df[target_col].unique()]

        print(f"\n[+] Target Column: '{target_col}' Verified")
        for val, count in vc.items():
            pct = vc_pct[val]
            label_meaning = "FRAUD" if str(val) in ["1", "Y", "Yes", "true", "True"] else "GENUINE / NON-FRAUD"
            print(f"    - Class {val} ({label_meaning}): {count:,} claims ({pct:.2f}%)")
    else:
        print(f"\n[!] WARNING: Target column '{target_col}' NOT found in dataset columns!", file=sys.stderr)
        target_info["found"] = False

    # 2. Missing Values Analysis
    missing_counts = df.isnull().sum()
    cols_with_missing = missing_counts[missing_counts > 0]
    missing_info = {}
    print(f"\n[*] Missing Value Analysis:")
    if len(cols_with_missing) == 0:
        print("    - No explicit NaN / null values found in any column.")
    else:
        print(f"    - Found missing values in {len(cols_with_missing)} columns:")
        for col, count in cols_with_missing.items():
            pct = (count / n_rows) * 100
            missing_info[col] = {"missing_count": int(count), "missing_pct": round(pct, 2)}
            print(f"      * {col}: {count:,} ({pct:.2f}%)")

    # 3. Duplicate Rows
    duplicates = int(df.duplicated().sum())
    print(f"\n[*] Duplicate Rows: {duplicates}")

    # 4. Column Type Classification
    numeric_cols: List[str] = []
    categorical_cols: List[str] = []
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)

    print(f"\n[*] Feature Classification:")
    print(f"    - Numerical features ({len(numeric_cols)}): {numeric_cols}")
    print(f"    - Categorical features ({len(categorical_cols)}): {categorical_cols}")

    # 5. Identifier & High Cardinality Candidates
    id_candidates: List[str] = []
    for col in df.columns:
        if col == target_col:
            continue
        # If every row is unique or column name specifically indicates ID
        col_lower = col.lower()
        is_id_name = (
            col_lower == "id"
            or col_lower.endswith("_id")
            or col_lower.startswith("id_")
            or "policynumber" in col_lower
            or "policy_number" in col_lower
            or "claimnumber" in col_lower
            or "claim_id" in col_lower
        )
        if df[col].nunique() == n_rows or is_id_name:
            id_candidates.append(col)

    print(f"\n[*] Identifier Candidates (Exclude from training to prevent memorization):")
    if id_candidates:
        for id_col in id_candidates:
            print(f"    - '{id_col}': {df[id_col].nunique()} unique values out of {n_rows} rows")
    else:
        print("    - None explicitly identified.")

    # 6. Specific Domain Anomalies
    anomalies: Dict[str, Any] = {}
    if "Age" in df.columns:
        zero_age = int((df["Age"] == 0).sum())
        if zero_age > 0:
            anomalies["Age_zero_count"] = zero_age
            print(f"\n[!] Domain Anomaly: 'Age' contains 0 in {zero_age:,} rows (indicates unknown / unrecorded age)")
    if "MonthClaimed" in df.columns:
        zero_month = int((df["MonthClaimed"].astype(str) == "0").sum())
        if zero_month > 0:
            anomalies["MonthClaimed_zero_count"] = zero_month
            print(f"[!] Domain Anomaly: 'MonthClaimed' contains '0' in {zero_month:,} row(s)")
    if "DayOfWeekClaimed" in df.columns:
        zero_dow = int((df["DayOfWeekClaimed"].astype(str) == "0").sum())
        if zero_dow > 0:
            anomalies["DayOfWeekClaimed_zero_count"] = zero_dow
            print(f"[!] Domain Anomaly: 'DayOfWeekClaimed' contains '0' in {zero_dow:,} row(s)")

    # 7. Potential Leakage or Bias Features
    leakage_candidates = []
    operational_candidates = []
    protected_candidates = []

    for col in df.columns:
        low = col.lower()
        if any(term in low for term in ["settlement", "payout", "outcome", "investigat", "decision", "post"]):
            leakage_candidates.append(col)
        if any(term in low for term in ["repnumber", "rep_number", "agentnumber", "adjuster"]):
            operational_candidates.append(col)
        if any(term in low for term in ["sex", "gender", "race", "maritalstatus", "marital_status"]):
            protected_candidates.append(col)

    print(f"\n[*] Potential Leakage & Governance Review:")
    print(f"    - Post-claim settlement / outcome leakage: {leakage_candidates if leakage_candidates else 'None detected'}")
    print(f"    - Operational internal assignment columns: {operational_candidates if operational_candidates else 'None'}")
    print(f"    - Protected demographic attributes (Governance/Fairness): {protected_candidates if protected_candidates else 'None'}")

    report = {
        "dataset_path": filepath,
        "rows": n_rows,
        "columns": n_cols,
        "target": target_info,
        "duplicates": duplicates,
        "missing_values": missing_info,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "identifier_candidates": id_candidates,
        "operational_candidates": operational_candidates,
        "protected_candidates": protected_candidates,
        "leakage_candidates": leakage_candidates,
        "anomalies": anomalies,
    }

    if output_json:
        os.makedirs(os.path.dirname(output_json) or ".", exist_ok=True)
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"\n[+] Inspection report saved to: {output_json}")

    print(f"\n========================================================\n")
    return report


def main():
    parser = argparse.ArgumentParser(description="Inspect raw insurance claim dataset.")
    parser.add_argument(
        "--data",
        type=str,
        default="data/raw/claims.csv",
        help="Path to CSV dataset (default: data/raw/claims.csv)",
    )
    parser.add_argument(
        "--target",
        type=str,
        default="FraudFound_P",
        help="Target column name (default: FraudFound_P)",
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default=None,
        help="Optional path to write JSON inspection report",
    )
    args = parser.parse_args()

    inspect_dataset(filepath=args.data, target_col=args.target, output_json=args.output_json)


if __name__ == "__main__":
    main()
