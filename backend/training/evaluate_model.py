"""Model Evaluation Utilities for Insurance Claim Fraud Risk Scoring.

Computes precision, recall, F1, PR-AUC, ROC-AUC, confusion matrix, business trade-offs,
and generates evaluation plots for PR and ROC curves.
"""

import os
from typing import Any, Dict, List, Optional, Tuple
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless/server/LinuxONE environments
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)


def compute_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """Computes comprehensive binary classification metrics at a given decision threshold.

    Parameters
    ----------
    y_true : np.ndarray
        Ground truth binary labels (0 or 1).
    y_prob : np.ndarray
        Predicted probabilities for the positive (fraud) class.
    threshold : float
        Decision threshold for classifying as fraud (default 0.5).

    Returns
    -------
    dict
        Dictionary of calculated metrics.
    """
    y_pred = (y_prob >= threshold).astype(int)

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    precision = float(precision_score(y_true, y_pred, zero_division=0))
    recall = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y_true, y_prob))
    except Exception:
        roc_auc = float("nan")

    try:
        pr_auc = float(average_precision_score(y_true, y_prob))
    except Exception:
        pr_auc = float("nan")

    total = len(y_true)
    fraud_count = int(np.sum(y_true == 1))
    genuine_count = int(np.sum(y_true == 0))

    metrics = {
        "threshold": round(float(threshold), 4),
        "total_claims": total,
        "genuine_claims": genuine_count,
        "fraud_claims": fraud_count,
        "fraud_prevalence": round(float(fraud_count / total if total > 0 else 0), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "pr_auc": round(pr_auc, 4),
        "roc_auc": round(roc_auc, 4),
        "business_impact": {
            "fraud_detected_pct": round(float(tp / fraud_count * 100 if fraud_count > 0 else 0), 2),
            "genuine_fast_tracked_pct": round(float(tn / genuine_count * 100 if genuine_count > 0 else 0), 2),
            "flagged_for_investigation_pct": round(float((tp + fp) / total * 100 if total > 0 else 0), 2),
            "missed_fraud_count": int(fn),
            "genuine_claims_reviewed_count": int(fp),
        },
        "classification_report": classification_report(
            y_true, y_pred, target_names=["Genuine (0)", "Fraud (1)"], output_dict=True, zero_division=0
        ),
    }

    return metrics


def find_optimal_threshold(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    min_recall: float = 0.50,
) -> Tuple[float, Dict[str, Any]]:
    """Selects an optimal business decision threshold using validation data.

    Searches candidate thresholds to maximize F1-score while maintaining
    a minimum acceptable fraud detection recall.

    Parameters
    ----------
    y_true : np.ndarray
        Validation ground truth.
    y_prob : np.ndarray
        Validation predicted probabilities.
    min_recall : float
        Minimum target recall for fraud detection (default 0.50).

    Returns
    -------
    tuple of (float, dict)
        Selected threshold and its metrics dictionary.
    """
    thresholds = np.linspace(0.05, 0.95, 91)
    best_threshold = 0.5
    best_f1 = -1.0
    best_metrics = None

    candidate_results = []
    for th in thresholds:
        m = compute_metrics(y_true, y_prob, threshold=float(th))
        candidate_results.append(m)

        # Prioritize F1 while respecting minimum recall
        if m["recall"] >= min_recall and m["f1_score"] > best_f1:
            best_f1 = m["f1_score"]
            best_threshold = float(th)
            best_metrics = m

    # Fallback if no threshold met min_recall: pick highest F1
    if best_metrics is None:
        best_candidate = max(candidate_results, key=lambda x: x["f1_score"])
        best_threshold = best_candidate["threshold"]
        best_metrics = best_candidate

    return best_threshold, best_metrics


def generate_evaluation_plots(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    selected_threshold: float,
    output_dir: str = "reports/figures",
    model_name: str = "RandomForest",
) -> List[str]:
    """Generates and saves PR curve, ROC curve, and confusion matrix visualizations.

    Parameters
    ----------
    y_true : np.ndarray
        True binary labels.
    y_prob : np.ndarray
        Predicted probabilities.
    selected_threshold : float
        Selected decision threshold.
    output_dir : str
        Directory to save figures.
    model_name : str
        Model descriptor for plot titles.

    Returns
    -------
    list of str
        Paths to generated figure files.
    """
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []

    # 1. Precision-Recall Curve
    precisions, recalls, pr_thresholds = precision_recall_curve(y_true, y_prob)
    pr_auc = average_precision_score(y_true, y_prob)

    plt.figure(figsize=(7, 5))
    plt.plot(recalls, precisions, color="#1f77b4", lw=2, label=f"PR Curve (AP = {pr_auc:.3f})")
    # Plot baseline prevalence
    baseline = np.mean(y_true)
    plt.axhline(y=baseline, color="gray", linestyle="--", label=f"Baseline Prevalence ({baseline:.1%})")
    # Mark selected threshold point
    y_pred_th = (y_prob >= selected_threshold).astype(int)
    th_rec = recall_score(y_true, y_pred_th, zero_division=0)
    th_prec = precision_score(y_true, y_pred_th, zero_division=0)
    plt.scatter([th_rec], [th_prec], color="red", s=80, zorder=5, label=f"Selected Thresh = {selected_threshold:.2f}")

    plt.xlabel("Recall (Fraud Detection Rate)", fontsize=11)
    plt.ylabel("Precision", fontsize=11)
    plt.title(f"Precision-Recall Curve — {model_name}", fontsize=12, fontweight="bold")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(loc="upper right")
    pr_path = os.path.join(output_dir, "pr_curve.png")
    plt.tight_layout()
    plt.savefig(pr_path, dpi=200)
    plt.close()
    generated_files.append(pr_path)

    # 2. ROC Curve
    fpr, tpr, roc_thresholds = roc_curve(y_true, y_prob)
    roc_auc = roc_auc_score(y_true, y_prob)

    plt.figure(figsize=(7, 5))
    plt.plot(fpr, tpr, color="#2ca02c", lw=2, label=f"ROC Curve (AUC = {roc_auc:.3f})")
    plt.plot([0, 1], [0, 1], color="gray", linestyle="--", label="Random Chance (AUC = 0.500)")
    plt.xlabel("False Positive Rate", fontsize=11)
    plt.ylabel("True Positive Rate (Recall)", fontsize=11)
    plt.title(f"ROC Curve — {model_name}", fontsize=12, fontweight="bold")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(loc="lower right")
    roc_path = os.path.join(output_dir, "roc_curve.png")
    plt.tight_layout()
    plt.savefig(roc_path, dpi=200)
    plt.close()
    generated_files.append(roc_path)

    # 3. Confusion Matrix Visualization
    cm = confusion_matrix(y_true, y_pred_th)
    tn, fp, fn, tp = cm.ravel()

    plt.figure(figsize=(6, 5))
    plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    plt.title(f"Confusion Matrix (Threshold = {selected_threshold:.2f})", fontsize=12, fontweight="bold")
    plt.colorbar()
    tick_marks = np.arange(2)
    plt.xticks(tick_marks, ["Genuine (0)", "Fraud (1)"], fontsize=10)
    plt.yticks(tick_marks, ["Genuine (0)", "Fraud (1)"], fontsize=10)

    # Cell text annotations with percentages
    thresh = cm.max() / 2.0
    for i in range(2):
        for j in range(2):
            cell_val = cm[i, j]
            color = "white" if cell_val > thresh else "black"
            subtext = "TN" if (i, j) == (0, 0) else ("FP" if (i, j) == (0, 1) else ("FN" if (i, j) == (1, 0) else "TP"))
            plt.text(
                j,
                i,
                f"{cell_val:,}\n({subtext})",
                horizontalalignment="center",
                verticalalignment="center",
                color=color,
                fontsize=11,
                fontweight="bold",
            )

    plt.ylabel("True Label", fontsize=11)
    plt.xlabel("Predicted Label", fontsize=11)
    cm_path = os.path.join(output_dir, "confusion_matrix.png")
    plt.tight_layout()
    plt.savefig(cm_path, dpi=200)
    plt.close()
    generated_files.append(cm_path)

    return generated_files


def generate_feature_importance_plot(
    feature_names: List[str],
    importances: np.ndarray,
    top_n: int = 15,
    output_dir: str = "reports/figures",
    model_name: str = "RandomForest",
) -> str:
    """Plots and saves the top N most important features.

    Parameters
    ----------
    feature_names : list of str
        Names of transformed features.
    importances : np.ndarray
        Corresponding importance values.
    top_n : int
        Number of top features to display.
    output_dir : str
        Directory to save plot.
    model_name : str
        Model descriptor.

    Returns
    -------
    str
        Path to saved figure.
    """
    os.makedirs(output_dir, exist_ok=True)
    indices = np.argsort(importances)[::-1][:top_n]
    top_feats = [feature_names[i] for i in indices]
    top_scores = [importances[i] for i in indices]

    # Clean display names: strip prefixes like 'cat__' and 'num__'
    clean_labels = [f.replace("cat__", "").replace("num__", "") for f in top_feats]

    plt.figure(figsize=(9, 6))
    y_pos = np.arange(len(top_feats))
    plt.barh(y_pos, top_scores[::-1], align="center", color="#3b528b", edgecolor="black", alpha=0.85)
    plt.yticks(y_pos, clean_labels[::-1], fontsize=9)
    plt.xlabel("Relative Feature Importance (MDI / Gini)", fontsize=11)
    plt.title(f"Top {top_n} Global Feature Importances — {model_name}", fontsize=12, fontweight="bold")
    plt.grid(True, axis="x", linestyle=":", alpha=0.6)
    plt.tight_layout()

    fig_path = os.path.join(output_dir, "feature_importance.png")
    plt.savefig(fig_path, dpi=200)
    plt.close()
    return fig_path
