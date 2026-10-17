"""Model Training and Selection Pipeline for Real-Time Insurance Claim Risk Scoring.

Trains baseline models (Random Forest and Logistic Regression), performs validation-based
model comparison, selects a business-justified decision threshold, evaluates on the held-out
test set, and serializes the complete end-to-end pipeline and metadata.
"""

import argparse
from datetime import datetime, timezone
import json
import os
import platform
import sys
from typing import Any, Dict, List

# Ensure project root is in sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from backend.training.evaluate_model import (
    compute_metrics,
    find_optimal_threshold,
    generate_evaluation_plots,
    generate_feature_importance_plot,
)
from backend.training.preprocess import (
    DEFAULT_EXCLUDE_COLUMNS,
    build_preprocessor,
    create_train_val_test_splits,
    split_features_target,
)


def train_and_evaluate_pipeline(
    data_path: str = "data/raw/claims.csv",
    target_col: str = "FraudFound_P",
    model_dir: str = "backend/models",
    reports_dir: str = "reports",
    random_state: int = 42,
    min_recall: float = 0.50,
) -> Dict[str, Any]:
    """Executes the full training, comparison, threshold tuning, and serialization pipeline.

    Parameters
    ----------
    data_path : str
        Path to raw CSV dataset.
    target_col : str
        Target column name (default 'FraudFound_P').
    model_dir : str
        Directory to save model artifacts.
    reports_dir : str
        Directory to save metrics, plots, and metadata.
    random_state : int
        Reproducibility seed.
    min_recall : float
        Minimum validation fraud recall for threshold selection.

    Returns
    -------
    dict
        Dictionary containing training summary and evaluation metrics.
    """
    print("\n========================================================")
    print("  INSURANCE CLAIM RISK SCORING — TRAINING PIPELINE")
    print("========================================================\n")

    os.makedirs(model_dir, exist_ok=True)
    figures_dir = os.path.join(reports_dir, "figures")
    os.makedirs(figures_dir, exist_ok=True)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    # 1. Load Data
    print(f"[*] Loading dataset from: {data_path}")
    raw_df = pd.read_csv(data_path)
    print(f"    - Raw dimensions: {raw_df.shape[0]:,} rows, {raw_df.shape[1]} columns")

    # 2. Segregate Features and Target
    print(f"[*] Preprocessing and splitting features (Target: '{target_col}')")
    print(f"    - Excluded columns: {DEFAULT_EXCLUDE_COLUMNS}")
    X, y, num_cols, cat_cols, label_mapping = split_features_target(
        raw_df, target_col=target_col, exclude_cols=None
    )
    print(f"    - Feature count: {X.shape[1]} ({len(num_cols)} numeric, {len(cat_cols)} categorical)")
    print(f"    - Class distribution: 0={int(np.sum(y == 0)):,} (Genuine), 1={int(np.sum(y == 1)):,} (Fraud)")
    fraud_rate = float(np.mean(y) * 100)
    print(f"    - Fraud rate: {fraud_rate:.2f}%")

    # 3. Stratified Train / Validation / Test Splitting
    print(f"[*] Performing stratified splitting (70% Train, 15% Validation, 15% Held-Out Test)...")
    X_train, y_train, X_val, y_val, X_test, y_test = create_train_val_test_splits(
        X, y, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, random_state=random_state
    )
    print(f"    - Train split: {len(X_train):,} samples (Fraud: {int(np.sum(y_train)):,}, {np.mean(y_train):.2%})")
    print(f"    - Validation split: {len(X_val):,} samples (Fraud: {int(np.sum(y_val)):,}, {np.mean(y_val):.2%})")
    print(f"    - Held-Out Test split: {len(X_test):,} samples (Fraud: {int(np.sum(y_test)):,}, {np.mean(y_test):.2%})")

    # 4. Build Preprocessor (Fitted strictly on Training set only)
    preprocessor = build_preprocessor(numeric_features=num_cols, categorical_features=cat_cols)

    # 5. Define Candidate Models
    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=6,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "LogisticRegression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            solver="lbfgs",
            random_state=random_state,
        ),
    }

    # 6. Train and Compare on Validation Set
    print("\n[*] Training candidate models on Train set & evaluating on Validation set...")
    val_comparisons: Dict[str, Any] = {}
    fitted_pipelines: Dict[str, Pipeline] = {}

    for name, clf in models.items():
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])
        print(f"    - Fitting {name}...")
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Validation Probabilities
        val_probs = pipeline.predict_proba(X_val)[:, 1]
        metrics_05 = compute_metrics(y_val.to_numpy(), val_probs, threshold=0.5)
        opt_thresh, opt_metrics = find_optimal_threshold(y_val.to_numpy(), val_probs, min_recall=min_recall)

        val_comparisons[name] = {
            "default_0_5_metrics": metrics_05,
            "optimal_threshold": opt_thresh,
            "optimal_metrics": opt_metrics,
        }

        print(
            f"      * {name} (Thresh 0.50): PR-AUC={metrics_05['pr_auc']:.3f}, ROC-AUC={metrics_05['roc_auc']:.3f}, "
            f"Recall={metrics_05['recall']:.3f}, Precision={metrics_05['precision']:.3f}, F1={metrics_05['f1_score']:.3f}"
        )
        print(
            f"      * {name} (Tuned Thresh {opt_thresh:.2f}): Recall={opt_metrics['recall']:.3f}, "
            f"Precision={opt_metrics['precision']:.3f}, F1={opt_metrics['f1_score']:.3f}"
        )

    # 7. Model Selection: Select based on PR-AUC, F1, and Fraud Detection Recall
    rf_pr_auc = val_comparisons["RandomForest"]["default_0_5_metrics"]["pr_auc"]
    lr_pr_auc = val_comparisons["LogisticRegression"]["default_0_5_metrics"]["pr_auc"]

    selected_model_name = "RandomForest" if rf_pr_auc >= lr_pr_auc else "LogisticRegression"
    selected_pipeline = fitted_pipelines[selected_model_name]
    selected_thresh = val_comparisons[selected_model_name]["optimal_threshold"]
    val_selected_metrics = val_comparisons[selected_model_name]["optimal_metrics"]

    print(f"\n[+] Selected Model: '{selected_model_name}' (PR-AUC: {val_comparisons[selected_model_name]['default_0_5_metrics']['pr_auc']:.4f})")
    print(f"    - Selected Decision Threshold: {selected_thresh:.2f} (derived from validation optimization)")

    # 8. Single Final Evaluation on Held-Out Test Set
    print("\n[*] Evaluating selected model on Held-Out Test set (Single pass, no tuning)...")
    test_probs = selected_pipeline.predict_proba(X_test)[:, 1]

    test_metrics_selected_th = compute_metrics(y_test.to_numpy(), test_probs, threshold=selected_thresh)
    test_metrics_default_th = compute_metrics(y_test.to_numpy(), test_probs, threshold=0.5)

    print(f"    - Held-Out Test Results (Selected Threshold = {selected_thresh:.2f}):")
    print(f"      * Recall (Fraud Detected): {test_metrics_selected_th['recall']:.2%}")
    print(f"      * Precision: {test_metrics_selected_th['precision']:.2%}")
    print(f"      * F1-Score: {test_metrics_selected_th['f1_score']:.4f}")
    print(f"      * PR-AUC (Average Precision): {test_metrics_selected_th['pr_auc']:.4f}")
    print(f"      * ROC-AUC: {test_metrics_selected_th['roc_auc']:.4f}")
    print(
        f"      * Confusion Matrix: TP={test_metrics_selected_th['confusion_matrix']['true_positives']}, "
        f"FP={test_metrics_selected_th['confusion_matrix']['false_positives']}, "
        f"FN={test_metrics_selected_th['confusion_matrix']['false_negatives']}, "
        f"TN={test_metrics_selected_th['confusion_matrix']['true_negatives']}"
    )

    # 9. Extract Global Feature Importances
    feature_importances_dict: Dict[str, float] = {}
    fitted_preprocessor = selected_pipeline.named_steps["preprocessor"]
    transformed_feature_names = fitted_preprocessor.get_feature_names_out().tolist()

    if hasattr(selected_pipeline.named_steps["classifier"], "feature_importances_"):
        raw_importances = selected_pipeline.named_steps["classifier"].feature_importances_
        sorted_indices = np.argsort(raw_importances)[::-1]
        for idx in sorted_indices:
            feat = transformed_feature_names[idx]
            feature_importances_dict[feat] = round(float(raw_importances[idx]), 6)

        generate_feature_importance_plot(
            transformed_feature_names,
            raw_importances,
            top_n=15,
            output_dir=figures_dir,
            model_name=selected_model_name,
        )

    # 10. Generate Evaluation Plots
    print(f"[*] Generating evaluation plots in {figures_dir}...")
    plot_files = generate_evaluation_plots(
        y_true=y_test.to_numpy(),
        y_prob=test_probs,
        selected_threshold=selected_thresh,
        output_dir=figures_dir,
        model_name=selected_model_name,
    )

    # 11. Save Complete Pipeline Artifact
    model_artifact_path = os.path.join(model_dir, "risk_model.joblib")
    print(f"[*] Serializing complete fitted pipeline to: {model_artifact_path}")
    joblib.dump(selected_pipeline, model_artifact_path, compress=3)

    # 12. Save Metadata and Schema
    model_version = "1.0.0"
    feature_schema = {col: str(X[col].dtype) for col in X.columns}

    metadata = {
        "model_version": model_version,
        "model_type": selected_model_name,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "python_version": sys.version,
        "os_architecture": platform.machine(),
        "os_system": platform.system(),
        "package_versions": {
            "scikit_learn": sklearn.__version__,
            "numpy": np.__version__,
            "pandas": pd.__version__,
            "joblib": joblib.__version__,
        },
        "dataset_source": data_path,
        "dataset_shape": {"rows": raw_df.shape[0], "columns": raw_df.shape[1]},
        "target_column": target_col,
        "label_mapping": label_mapping,
        "features": {
            "total_feature_count": len(X.columns),
            "numeric_features": num_cols,
            "categorical_features": cat_cols,
            "transformed_feature_count": len(transformed_feature_names),
            "feature_schema": feature_schema,
        },
        "excluded_columns": DEFAULT_EXCLUDE_COLUMNS,
        "train_val_test_counts": {
            "train": len(X_train),
            "val": len(X_val),
            "test": len(X_test),
        },
        "selected_threshold": round(float(selected_thresh), 4),
        "threshold_policy": {
            "risk_categories": {
                "LOW": f"risk_score < {round((selected_thresh * 0.7) * 100, 1)}",
                "MEDIUM": f"{round((selected_thresh * 0.7) * 100, 1)} <= risk_score < {round(selected_thresh * 100, 1)}",
                "HIGH": f"risk_score >= {round(selected_thresh * 100, 1)} (flag for human investigation)",
            },
            "selection_justification": (
                "Threshold selected on validation data to maximize F1-score and ensure "
                f"at least {min_recall:.0%} recall for fraud detection in an imbalanced setting."
            ),
        },
    }

    metadata_path = os.path.join(model_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 13. Save Comprehensive Metrics
    metrics_report = {
        "model_name": selected_model_name,
        "selected_threshold": round(float(selected_thresh), 4),
        "validation_comparison": val_comparisons,
        "validation_selected_metrics": val_selected_metrics,
        "test_metrics_selected_threshold": test_metrics_selected_th,
        "test_metrics_default_0_5_threshold": test_metrics_default_th,
    }

    metrics_path = os.path.join(model_dir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)

    # 14. Save Feature Importances
    fi_path = os.path.join(model_dir, "feature_importance.json")
    with open(fi_path, "w", encoding="utf-8") as f:
        json.dump(feature_importances_dict, f, indent=2)

    print("\n========================================================")
    print("  TRAINING COMPLETE — ARTIFACTS GENERATED:")
    print(f"  [1] Pipeline Binary:    {model_artifact_path}")
    print(f"  [2] Model Metadata:     {metadata_path}")
    print(f"  [3] Metrics Report:     {metrics_path}")
    print(f"  [4] Feature Importance: {fi_path}")
    print(f"  [5] Figures:            {figures_dir}")
    print("========================================================\n")

    return metrics_report


def main():
    parser = argparse.ArgumentParser(description="Train insurance claim fraud risk scoring pipeline.")
    parser.add_argument(
        "--data",
        type=str,
        default="data/raw/claims.csv",
        help="Path to raw CSV dataset (default: data/raw/claims.csv)",
    )
    parser.add_argument(
        "--target",
        type=str,
        default="FraudFound_P",
        help="Target column name (default: FraudFound_P)",
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default="backend/models",
        help="Directory to save model artifacts (default: backend/models)",
    )
    parser.add_argument(
        "--reports-dir",
        type=str,
        default="reports",
        help="Directory to save reports & figures (default: reports)",
    )
    parser.add_argument(
        "--random-state",
        type=int,
        default=42,
        help="Reproducibility seed (default: 42)",
    )
    parser.add_argument(
        "--min-recall",
        type=float,
        default=0.50,
        help="Minimum target recall for validation threshold selection (default: 0.50)",
    )
    args = parser.parse_args()

    train_and_evaluate_pipeline(
        data_path=args.data,
        target_col=args.target,
        model_dir=args.model_dir,
        reports_dir=args.reports_dir,
        random_state=args.random_state,
        min_recall=args.min_recall,
    )


if __name__ == "__main__":
    main()
