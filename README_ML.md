# Real-Time Insurance Claim Fraud Risk Scoring — ML Module

> **IBM Z Datathon 2026**  
> **Role:** Member 1: AI/ML Engineering  
> **Mission:** Faster payouts for genuine customers, earlier detection of fraudulent claims.  
> **Architecture Target:** IBM LinuxONE (s390x) & Linux/x86_64 compatible.

---

## 1. Executive Summary

This repository contains the complete production-conscious Machine Learning pipeline for real-time insurance claim fraud risk scoring. The system acts as an automated decision-support triage engine:

1. **Expedited Straight-Through Processing (LOW Risk):** Genuine claims with low risk scores are expedited for rapid settlement, significantly reducing claim cycle times and boosting customer satisfaction.
2. **Standard Workflow (MEDIUM Risk):** Claims with intermediate probability undergo standard processing with automated document validation.
3. **Targeted Investigation Triage (HIGH Risk):** Claims exceeding the empirically calibrated risk threshold are prioritized for manual audit by human Special Investigation Unit (SIU) adjusters—detecting fraud earlier while avoiding costly automatic claim denials.

---

## 2. Dataset Provenance, Target Definition & Schema

### A. Dataset Source & Permitted Use
- **Primary Benchmark:** [Vehicle Insurance Claim Fraud Detection (Kaggle / Oracle Case Study)](https://www.kaggle.com/datasets/shivamb/vehicle-claim-fraud-detection)
- **Alternate Benchmark Investigated:** [Auto Insurance Claims Data (Kaggle: Bunty Shah)](https://www.kaggle.com/datasets/buntyshah/auto-insurance-claims-data) (evaluated but rejected for production baseline due to sample size limitations: only 1,000 records).
- **Dimensions:** 15,420 historical claims, 33 attributes.
- **License / Permitted Use:** Public domain research/educational dataset.
- **Security & Privacy:** Raw datasets and trained serialized binaries (`.joblib`) are excluded from Git commits via `.gitignore` to prevent committing sensitive or licensed customer information.

### B. Target Column Definition & Fraud Label Mapping
- **Target Column:** `FraudFound_P`
- **Class 0 (GENUINE / NON-FRAUD):** 14,497 claims (94.01%)
- **Class 1 (FRAUD):** 923 claims (5.99%)
- **Prevalence:** Highly imbalanced (~5.99% fraud rate), reflecting authentic insurance market conditions.

### C. Column Categorization & Governance
- **Target:** `FraudFound_P` (0 = Genuine, 1 = Fraud)
- **Identifiers Excluded:** `PolicyNumber` (100% unique per row, excluded to prevent memorization / false correlation).
- **Operational Internal Excluded:** `RepNumber` (claim representative internal ID, excluded to prevent adjuster assignment bias).
- **Ethical Governance / Protected Demographic Exclusions:** `Sex`, `MaritalStatus` (excluded by default in `preprocess.py` to uphold algorithmic fairness, anti-bias insurance regulations, and Responsible AI principles).
- **Domain Anomaly Handling:**
  - `Age == 0` (320 records): Converted to `NaN` and imputed via training median.
  - `MonthClaimed == '0'` / `DayOfWeekClaimed == '0'` (1 record): Converted to `NaN` and imputed via mode.

---

## 3. Machine Learning Architecture & Technical Stack

The module strictly avoids heavyweight C++ dependencies (e.g. PyTorch, heavy booster binaries) to ensure 100% compatibility with **IBM LinuxONE (s390x)** and commodity environments:

- **Python Version:** 3.11 or 3.12
- **Core Stack:** `numpy>=1.24.0`, `pandas>=2.0.0`, `scikit-learn>=1.3.0`, `joblib>=1.3.0`, `matplotlib>=3.7.0`
- **Validation & API Contract:** `pydantic>=2.0.0`
- **Testing:** `pytest>=7.4.0`

### Model Selection & Validation
- **Baseline Models Compared:**
  1. `RandomForestClassifier(n_estimators=150, max_depth=12, class_weight='balanced', random_state=42)`
  2. `LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)`
- **Comparison Metric:** Precision-Recall AUC (PR-AUC / Average Precision) on the held-out validation set.
- **Model Winner:** **Random Forest Classifier** (`PR-AUC = 0.241`, vs Logistic Regression `0.175`; baseline prevalence `0.060`).
- **ROC-AUC on Held-Out Test Set:** `0.8062`.

---

## 4. Business Threshold Optimization & Triage Policy

In an imbalanced insurance fraud setting (~6% fraud), a default naive threshold of `0.50` produces severe false negatives (missing legitimate fraud) or high false positive rates when class weighting is used.

Our pipeline implements a **validation-based threshold optimization** (`backend/training/evaluate_model.py:find_optimal_threshold`) that searches candidate thresholds to maximize F1-score while guaranteeing at least 50% fraud detection recall.

### Selected Threshold Configuration
- **Selected Investigation Threshold:** `0.61` (calibrated on Validation split)
- **Triage Policy:**
  - **LOW Risk (`risk_score < 42.7`):** Genuine claim; fast-track for instant automated payout.
  - **MEDIUM Risk (`42.7 <= risk_score < 61.0`):** Standard processing; routine verification.
  - **HIGH Risk (`risk_score >= 61.0`):** Flagged for manual investigation by SIU adjusters.

---

## 5. LinuxONE (s390x) Compatibility Guide

The IBM LinuxONE mainframe architecture (`s390x`, Big-Endian / 64-bit) requires specific considerations:

1. **Verify Architecture:**
   ```bash
   uname -m
   # Outputs: s390x (on LinuxONE) or x86_64 (on standard workstations)
   ```
2. **Wheel & Library Compatibility:**
   - Standard scientific wheels for `numpy`, `scikit-learn`, `pandas`, and `joblib` are available natively on modern Linux distributions supported by LinuxONE (RHEL 9, SLES 15, Ubuntu 22.04/24.04 LTS).
   - If building from source on minimal LinuxONE partitions, ensure `gcc`, `gcc-c++`, and `python3-devel` are present:
     ```bash
     # RHEL / Rocky Linux on s390x:
     sudo dnf install -y python3-devel gcc gcc-c++ make
     
     # Ubuntu on s390x:
     sudo apt-get install -y python3-dev build-essential
     ```
3. **No Heavyweight C++ Blackboxes:**
   - Explanations are computed via lightweight, native scikit-learn feature importances in `ml/explain.py` rather than native C++ compilation modules (e.g. raw SHAP C-extensions), preventing build failures on s390x.
4. **Serialization Portability:**
   - Model artifact `backend/models/risk_model.joblib` is saved using standard joblib compression (`compress=3`) and loads cleanly across both s390x and x86_64 environments running compatible scikit-learn versions.

---

## 6. Installation & Execution Commands

### A. Environment Setup
```bash
# Clone the repository
git clone <repo-url>
cd insurance-risk-scoring

# Create and activate virtual environment
python -m venv venv
# Linux / macOS / LinuxONE:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### B. Dataset Acquisition
```bash
# Automated download helper:
python data/download_dataset.py

# Or manually:
# Download 'fraud_oracle.csv' from Kaggle and place at data/raw/claims.csv
```

### C. Data Health Inspection
```bash
python backend/training/inspect_data.py --data data/raw/claims.csv --target FraudFound_P --output-json reports/data_inspection.json
```

### D. Model Training & Threshold Tuning
```bash
python backend/training/train_model.py --data data/raw/claims.csv --target FraudFound_P
```

### E. Run Automated Test Suite
```bash
pytest -v
```

---

## 7. Model Artifacts & Outputs

All generated artifacts are saved under version control governance:

| Artifact Path | Description |
| :--- | :--- |
| `backend/models/risk_model.joblib` | Complete fitted end-to-end `Pipeline` (preprocessing + Random Forest classifier). |
| `backend/models/metadata.json` | Model version, package versions, feature schemas, excluded columns, threshold policy. |
| `backend/models/metrics.json` | Genuine validation and test metrics, confusion matrix, baseline comparison. |
| `backend/models/feature_importance.json` | Top features ranked by relative importance weight. |
| `reports/figures/pr_curve.png` | Precision-Recall curve with selected decision threshold marked. |
| `reports/figures/roc_curve.png` | Receiver Operating Characteristic curve. |
| `reports/figures/confusion_matrix.png` | Confusion matrix heatmap with cell counts. |
| `reports/figures/feature_importance.png` | Bar chart of the top 15 predictive features. |

---

## 8. Integration Contract with Member 2 (FastAPI Backend)

Member 2 owns the FastAPI service and does **not** need to implement any preprocessing or model logic. Member 2 interacts directly with the `ml` package.

### A. Available Python Interface (`ml.predict`)

```python
from ml.predict import load_model, score_claim, score_claims, get_model_info

# 1. Preload model during FastAPI startup:
model, metadata = load_model()

# 2. Score a single claim (returns clean Python dict ready for JSON response):
result = score_claim(claim_dict)

# 3. Score a batch of claims:
batch_result = score_claims([claim_dict_1, claim_dict_2])

# 4. Get active model info:
info = get_model_info()
```

### B. Standard Output Response Contract
```json
{
  "risk_score": 85.4,
  "fraud_probability": 0.8542,
  "risk_category": "HIGH",
  "model_version": "1.0.0",
  "threshold_used": 0.61,
  "requires_human_review": true,
  "explanation": "Model-estimated risk score is 85.4/100, exceeding the investigation threshold of 61.0. Recommended action: prioritize for manual human audit.",
  "top_risk_factors": [
    {
      "feature": "Fault",
      "value": "Policy Holder",
      "contribution_direction": "INCREASES_RISK",
      "importance_weight": 0.1112,
      "description": "Feature 'Fault' with value 'Policy Holder' is a strong statistical indicator in historical claim triage."
    },
    {
      "feature": "Age",
      "value": "21",
      "contribution_direction": "INCREASES_RISK",
      "importance_weight": 0.0276,
      "description": "Feature 'Age' with value '21' is a strong statistical indicator in historical claim triage."
    }
  ]
}
```

### C. Sample Synthetic Request for API Testing
```json
{
  "features": {
    "Month": "Jan",
    "WeekOfMonth": 3,
    "DayOfWeek": "Monday",
    "Make": "Honda",
    "AccidentArea": "Urban",
    "DayOfWeekClaimed": "Tuesday",
    "MonthClaimed": "Jan",
    "WeekOfMonthClaimed": 4,
    "Age": 34,
    "Fault": "Policy Holder",
    "PolicyType": "Sedan - Collision",
    "VehicleCategory": "Sedan",
    "VehiclePrice": "20000 to 29000",
    "Deductible": 400,
    "DriverRating": 2,
    "Days_Policy_Accident": "more than 30",
    "Days_Policy_Claim": "more than 30",
    "PastNumberOfClaims": "none",
    "AgeOfVehicle": "5 years",
    "AgeOfPolicyHolder": "31 to 35",
    "PoliceReportFiled": "No",
    "WitnessPresent": "No",
    "AgentType": "External",
    "NumberOfSuppliments": "none",
    "AddressChange_Claim": "no change",
    "NumberOfCars": "1 vehicle",
    "Year": 1995,
    "BasePolicy": "Collision"
  }
}
```

### D. Ready-to-Run FastAPI Example
Member 2 can refer to `backend/app/example_fastapi_usage.py` for a complete, tested implementation.

---

## 9. Responsible AI & Insurance Safeguards

1. **Decision Support, Not Automated Denial:** The risk score is a triage mechanism. A high risk score **never** triggers an automatic claim denial or adverse decision; it solely routes the claim to a qualified human fraud investigator.
2. **Expedited Genuine Claims:** Low-risk claims are prioritized for straight-through processing, ensuring genuine customers receive faster payouts during stressful life events.
3. **Protection of Sensitive Attributes:** Features such as `Sex` and `MaritalStatus` are excluded from the model's feature set to prevent algorithmic discrimination or proxy-based bias.
4. **Historical Label Caveat:** Historical fraud labels in insurance datasets reflect past investigation and audit practices, not necessarily ground-truth fraud. Model predictions should be monitored for drift and audit bias over time.
5. **No Customer PII in Metadata or Logs:** Customer identifiers (`PolicyNumber`) are excluded from modeling features, and sensitive customer data is never written to public logs or metadata files.

---

## 10. Known Limitations & Future Enhancements

- **Unstructured Data:** Current pipeline utilizes structured tabular claim fields. Future iterations could integrate NLP analysis of police incident narrative reports.
- **Temporal Out-of-Time Validation:** Future iterations could evaluate temporal shifts across multiple claim calendar years to test macro-economic resilience.
- **Fairness & Disparate Impact Auditing:** Ongoing periodic auditing using disparate impact ratios across demographic segments when legally permissible under insurance underwriting regulations.
