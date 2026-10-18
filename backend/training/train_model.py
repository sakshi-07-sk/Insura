"""Model Training and Selection Pipeline for Real-Time Insurance Claim Risk Scoring.

Trains candidate models (HistGradientBoosting, Random Forest, and Logistic Regression),
performs 5-fold Stratified Cross-Validation for model selection, applies CalibratedClassifierCV
for honest, reliable probability estimates, tunes business-optimal decision thresholds,
evaluates on held-out test data, and serializes the complete pipeline and metadata.
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
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.metrics import average_precision_score, roc_auc_score, brier_score_loss

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
    """Executes the full training, comparison, calibration, threshold tuning, and serialization pipeline.

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

    # 5. Define Candidate Architectures
    models = {
        "HistGradientBoosting": HistGradientBoostingClassifier(
            max_iter=150,
            max_depth=8,
            min_samples_leaf=15,
            class_weight="balanced",
            random_state=random_state,
        ),
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

    # 6. Cross-Validation and Model Comparison on Training Set
    print("\n[*] Running 5-Fold Stratified Cross-Validation across candidate models...")
    min_class_count = min(int(np.sum(y_train == 0)), int(np.sum(y_train == 1)))
    n_splits = min(5, min_class_count)

    cv_results: Dict[str, Any] = {}
    val_comparisons: Dict[str, Any] = {}
    uncalibrated_fitted_pipes: Dict[str, Pipeline] = {}

    for name, clf in models.items():
        pipe = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])

        # Cross validation scores
        if n_splits >= 2:
            cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
            cv_pr = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="average_precision")
            cv_roc = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc")
            cv_results[name] = {
                "mean_cv_pr_auc": round(float(np.mean(cv_pr)), 4),
                "std_cv_pr_auc": round(float(np.std(cv_pr)), 4),
                "mean_cv_roc_auc": round(float(np.mean(cv_roc)), 4),
                "std_cv_roc_auc": round(float(np.std(cv_roc)), 4),
            }
            print(f"    - {name}: CV PR-AUC = {np.mean(cv_pr):.4f} (+/- {np.std(cv_pr):.4f}), CV ROC-AUC = {np.mean(cv_roc):.4f}")
        else:
            cv_results[name] = {"mean_cv_pr_auc": 0.0, "mean_cv_roc_auc": 0.0}

        # Fit on full training set
        pipe.fit(X_train, y_train)
        uncalibrated_fitted_pipes[name] = pipe

        # Evaluate raw validation probabilities
        val_probs_raw = pipe.predict_proba(X_val)[:, 1]
        metrics_05 = compute_metrics(y_val.to_numpy(), val_probs_raw, threshold=0.5)
        opt_thresh, opt_metrics = find_optimal_threshold(y_val.to_numpy(), val_probs_raw, min_recall=min_recall)

        val_comparisons[name] = {
            "default_0_5_metrics": metrics_05,
            "optimal_threshold": opt_thresh,
            "optimal_metrics": opt_metrics,
            "cv_scores": cv_results[name],
        }

    # 7. Model Selection based on CV and Validation PR-AUC
    selected_model_name = max(
        models.keys(),
        key=lambda k: cv_results[k]["mean_cv_pr_auc"]
        if cv_results[k]["mean_cv_pr_auc"] > 0
        else val_comparisons[k]["default_0_5_metrics"]["pr_auc"]
    )
    print(f"\n[+] Champion Architecture Selected: '{selected_model_name}'")

    # 8. Probability Calibration with CalibratedClassifierCV
    print(f"[*] Applying probability calibration (CalibratedClassifierCV, sigmoid)...")
    base_clf = models[selected_model_name]

    # Pre-transform training and validation data using fitted preprocessor
    fitted_preprocessor = preprocessor.fit(X_train)
    X_train_trans = fitted_preprocessor.transform(X_train)
    X_val_trans = fitted_preprocessor.transform(X_val)
    X_test_trans = fitted_preprocessor.transform(X_test)

    cal_cv = min(5, min_class_count)
    if cal_cv >= 2:
        calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method="sigmoid", cv=cal_cv)
    else:
        calibrated_clf = base_clf

    calibrated_clf.fit(X_train_trans, y_train)

    # Build final serializable pipeline
    selected_pipeline = Pipeline(steps=[("preprocessor", fitted_preprocessor), ("classifier", calibrated_clf)])

    # 9. Threshold Selection using Calibrated Validation Probabilities
    print("\n[*] Optimizing decision threshold on calibrated validation probabilities...")
    val_cal_probs = selected_pipeline.predict_proba(X_val)[:, 1]
    raw_val_brier = brier_score_loss(y_val, uncalibrated_fitted_pipes[selected_model_name].predict_proba(X_val)[:, 1])
    cal_val_brier = brier_score_loss(y_val, val_cal_probs)

    print(f"    - Brier Calibration Loss: Raw = {raw_val_brier:.4f} -> Calibrated = {cal_val_brier:.4f}")

    selected_thresh, val_selected_metrics = find_optimal_threshold(
        y_val.to_numpy(), val_cal_probs, min_recall=min_recall
    )
    print(f"    - Selected Decision Threshold: {selected_thresh:.2f} (derived from validation optimization)")
    print(f"    - Validation Performance: Recall = {val_selected_metrics['recall']:.2%}, "
          f"Precision = {val_selected_metrics['precision']:.2%}, F1 = {val_selected_metrics['f1_score']:.4f}")

    # 10. Single Final Evaluation on Held-Out Test Set
    print("\n[*] Evaluating calibrated champion model on Held-Out Test set...")
    test_probs = selected_pipeline.predict_proba(X_test)[:, 1]
    test_brier = brier_score_loss(y_test, test_probs)

    test_metrics_selected_th = compute_metrics(y_test.to_numpy(), test_probs, threshold=selected_thresh)
    test_metrics_default_th = compute_metrics(y_test.to_numpy(), test_probs, threshold=0.5)

    print(f"    - Held-Out Test Results (Selected Threshold = {selected_thresh:.2f}):")
    print(f"      * Recall (Fraud Detected): {test_metrics_selected_th['recall']:.2%}")
    print(f"      * Precision: {test_metrics_selected_th['precision']:.2%}")
    print(f"      * F1-Score: {test_metrics_selected_th['f1_score']:.4f}")
    print(f"      * PR-AUC (Average Precision): {test_metrics_selected_th['pr_auc']:.4f}")
    print(f"      * ROC-AUC: {test_metrics_selected_th['roc_auc']:.4f}")
    print(f"      * Brier Score (Calibration): {test_brier:.4f}")
    print(
        f"      * Confusion Matrix: TP={test_metrics_selected_th['confusion_matrix']['true_positives']}, "
        f"FP={test_metrics_selected_th['confusion_matrix']['false_positives']}, "
        f"FN={test_metrics_selected_th['confusion_matrix']['false_negatives']}, "
        f"TN={test_metrics_selected_th['confusion_matrix']['true_negatives']}"
    )

    # 11. Extract Feature Importances
    feature_importances_dict: Dict[str, float] = {}
    transformed_feature_names = fitted_preprocessor.get_feature_names_out().tolist()

    # Retrieve base classifier importances if available
    raw_importances = None
    if hasattr(calibrated_clf, "calibrated_classifiers_"):
        first_cal = calibrated_clf.calibrated_classifiers_[0]
        base_estimator = getattr(first_cal, "estimator", getattr(first_cal, "base_estimator", None))
        if hasattr(base_estimator, "feature_importances_"):
            # Average across calibrated ensemble folds
            fold_imps = [
                getattr(c, "estimator", getattr(c, "base_estimator", None)).feature_importances_
                for c in calibrated_clf.calibrated_classifiers_
                if hasattr(getattr(c, "estimator", getattr(c, "base_estimator", None)), "feature_importances_")
            ]
            if fold_imps:
                raw_importances = np.mean(fold_imps, axis=0)

    if raw_importances is None:
        # Fall back to uncalibrated pipeline or permutation importance
        uncal_clf = uncalibrated_fitted_pipes[selected_model_name].named_steps["classifier"]
        if hasattr(uncal_clf, "feature_importances_"):
            raw_importances = uncal_clf.feature_importances_

    if raw_importances is not None:
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

    # 12. Generate Evaluation Plots
    print(f"[*] Generating evaluation plots in {figures_dir}...")
    generate_evaluation_plots(
        y_true=y_test.to_numpy(),
        y_prob=test_probs,
        selected_threshold=selected_thresh,
        output_dir=figures_dir,
        model_name=selected_model_name,
    )

    # 13. Save Complete Pipeline Artifact
    model_artifact_path = os.path.join(model_dir, "risk_model.joblib")
    print(f"[*] Serializing complete fitted pipeline to: {model_artifact_path}")
    joblib.dump(selected_pipeline, model_artifact_path, compress=3)

    # 14. Save Metadata and Schema
    model_version = "1.0.0"
    feature_schema = {col: str(X[col].dtype) for col in X.columns}

    metadata = {
        "model_version": model_version,
        "model_type": selected_model_name,
        "is_calibrated": True,
        "calibration_method": "sigmoid",
        "cross_validation_folds": n_splits,
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
                "Calibrated threshold selected on validation data to maximize F1-score and ensure "
                f"at least {min_recall:.0%} recall for fraud detection in an imbalanced setting."
            ),
        },
    }

    metadata_path = os.path.join(model_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 15. Save Comprehensive Metrics
    metrics_report = {
        "model_name": selected_model_name,
        "selected_threshold": round(float(selected_thresh), 4),
        "cross_validation": cv_results,
        "validation_comparison": val_comparisons,
        "validation_selected_metrics": val_selected_metrics,
        "test_metrics_selected_threshold": test_metrics_selected_th,
        "test_metrics_default_0_5_threshold": test_metrics_default_th,
        "test_brier_score": round(float(test_brier), 4),
    }

    metrics_path = os.path.join(model_dir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)

    # 16. Save Feature Importances
    fi_path = os.path.join(model_dir, "feature_importance.json")
    with open(fi_path, "w", encoding="utf-8") as f:
        json.dump(feature_importances_dict, f, indent=2)

    print("\n========================================================")
    print("  TRAINING COMPLETE — ARTIFACTS GENERATED:")
    print(f"  [1] Pipeline Binary:    {model_artifact_path}")
    print(f"  [2] Metadata JSON:      {metadata_path}")
    print(f"  [3] Metrics JSON:       {metrics_path}")
    print(f"  [4] Feature Importance: {fi_path}")
    print("========================================================\n")

    return {
        "model_name": selected_model_name,
        "selected_threshold": selected_thresh,
        "validation_selected_metrics": val_selected_metrics,
        "test_metrics_selected_threshold": test_metrics_selected_th,
        "test_metrics_default_threshold": test_metrics_default_th,
        "model_artifact_path": model_artifact_path,
        "metadata_path": metadata_path,
        "metrics_path": metrics_path,
    }


def main():
    parser = argparse.ArgumentParser(description="Train insurance fraud risk scoring model.")
    parser.add_argument("--data", type=str, default="data/raw/claims.csv", help="Path to raw dataset")
    parser.add_argument("--target", type=str, default="FraudFound_P", help="Target column name")
    parser.add_argument("--model-dir", type=str, default="backend/models", help="Model artifact directory")
    parser.add_argument("--reports-dir", type=str, default="reports", help="Reports directory")
    parser.add_argument("--seed", type=int, default=42, help="Random state seed")
    parser.add_argument("--min-recall", type=float, default=0.50, help="Minimum validation recall")
    args = parser.parse_args()

    train_and_evaluate_pipeline(
        data_path=args.data,
        target_col=args.target,
        model_dir=args.model_dir,
        reports_dir=args.reports_dir,
        random_state=args.seed,
        min_recall=args.min_recall,
    )


if __name__ == "__main__":
    main()
