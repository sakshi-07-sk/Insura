/**
 * Genuine Offline Model Evaluation Metrics & Feature Importance
 * Sourced directly from Member 1's confirmed artifacts:
 * - backend/models/metrics.json
 * - backend/models/feature_importance.json
 * - backend/models/metadata.json
 * 
 * Note: Clearly labeled as offline validation and held-out test evaluation benchmarks,
 * never fabricated live statistics.
 */

export const OFFLINE_MODEL_METADATA = {
  model_name: 'Random Forest Classifier (Ensemble)',
  model_version: '1.0.0',
  training_timestamp: '2026-10-17T09:01:25Z',
  python_version: '3.12.10',
  architecture_target: 'IBM LinuxONE (s390x) & x86_64',
  frameworks: {
    scikit_learn: '1.9.0',
    numpy: '2.5.2',
    pandas: '3.0.5',
    joblib: '1.6.0'
  },
  dataset: {
    source: 'Vehicle Insurance Claim Fraud Benchmark (Oracle / Kaggle Case Study)',
    total_records: 15420,
    features_count: 28,
    encoded_feature_dimensions: 138,
    class_0_genuine: 14497,
    class_1_fraud: 923,
    fraud_prevalence_pct: 5.99,
    splits: {
      train: 10794,
      validation: 2313,
      test: 2313
    }
  },
  threshold_policy: {
    selected_threshold: 0.61,
    low_cutoff: 42.7,
    high_cutoff: 61.0,
    triage_tiers: {
      LOW: 'risk_score < 42.7 (Fast-track settlement)',
      MEDIUM: '42.7 <= risk_score < 61.0 (Standard verification)',
      HIGH: 'risk_score >= 61.0 (Flagged for SIU human investigation)'
    },
    justification: 'Calibrated on held-out validation set to optimize F1-score while guaranteeing >= 50% fraud recall in a severely imbalanced (6% positive class) distribution.'
  }
};

export const HELD_OUT_TEST_METRICS = {
  test_size: 2313,
  genuine_count: 2175,
  fraud_count: 138,
  selected_threshold: 0.61,
  roc_auc: 0.8062,
  pr_auc: 0.2319,
  precision: 0.1808,
  recall: 0.4638,
  f1_score: 0.2602,
  accuracy: 0.8426,
  confusion_matrix: {
    true_negatives: 1885,
    false_positives: 290,
    false_negatives: 74,
    true_positives: 64
  },
  business_impact: {
    genuine_fast_tracked_pct: 86.67,
    fraud_detected_pct: 46.38,
    claims_flagged_for_investigation_pct: 15.30,
    genuine_claims_reviewed_count: 290,
    missed_fraud_count: 74
  }
};

export const VALIDATION_COMPARISON = [
  {
    model: 'Random Forest (Optimal Threshold = 0.61)',
    pr_auc: 0.2408,
    roc_auc: 0.8473,
    f1_score: 0.2972,
    fraud_recall: 0.5324,
    precision: 0.2061,
    genuine_fast_track: 86.89,
    flag_rate: 15.52
  },
  {
    model: 'Random Forest (Default Threshold = 0.50)',
    pr_auc: 0.2408,
    roc_auc: 0.8473,
    f1_score: 0.2477,
    fraud_recall: 0.8849,
    precision: 0.1440,
    genuine_fast_track: 66.38,
    flag_rate: 36.92
  },
  {
    model: 'Logistic Regression (Optimal Threshold = 0.68)',
    pr_auc: 0.1749,
    roc_auc: 0.8238,
    f1_score: 0.2815,
    fraud_recall: 0.6187,
    precision: 0.1822,
    genuine_fast_track: 82.24,
    flag_rate: 20.41
  },
  {
    model: 'Logistic Regression (Default Threshold = 0.50)',
    pr_auc: 0.1749,
    roc_auc: 0.8238,
    f1_score: 0.2317,
    fraud_recall: 0.8777,
    precision: 0.1335,
    genuine_fast_track: 63.57,
    flag_rate: 39.52
  }
];

export const TOP_FEATURE_IMPORTANCES = [
  { feature: 'Fault: Third Party', importance: 0.142094, category: 'Fault Determination', group: 'Incident' },
  { feature: 'Fault: Policy Holder', importance: 0.111174, category: 'Fault Determination', group: 'Incident' },
  { feature: 'BasePolicy: Liability', importance: 0.074195, category: 'Policy Coverage', group: 'Policy' },
  { feature: 'PolicyType: Sedan - Liability', importance: 0.073765, category: 'Policy Type', group: 'Policy' },
  { feature: 'VehicleCategory: Sport', importance: 0.052827, category: 'Vehicle Category', group: 'Vehicle' },
  { feature: 'VehicleCategory: Sedan', importance: 0.043059, category: 'Vehicle Category', group: 'Vehicle' },
  { feature: 'Driver Age (Years)', importance: 0.027629, category: 'Policyholder Age', group: 'Demographics' },
  { feature: 'BasePolicy: Collision', importance: 0.022657, category: 'Policy Coverage', group: 'Policy' },
  { feature: 'BasePolicy: All Perils', importance: 0.020797, category: 'Policy Coverage', group: 'Policy' },
  { feature: 'PolicyType: Sedan - All Perils', importance: 0.020536, category: 'Policy Type', group: 'Policy' },
  { feature: 'Address Change: 2 to 3 yrs', importance: 0.019215, category: 'Filing Circumstance', group: 'History' },
  { feature: 'Deductible Tier ($)', importance: 0.019204, category: 'Policy Term', group: 'Policy' },
  { feature: 'Incident Year', importance: 0.017417, category: 'Chronology', group: 'Incident' },
  { feature: 'Address Change: No Change', importance: 0.015070, category: 'Filing Circumstance', group: 'History' },
  { feature: 'Week of Month Claimed', importance: 0.011931, category: 'Timing', group: 'Filing' },
  { feature: 'Week of Month Incident', importance: 0.011103, category: 'Timing', group: 'Incident' },
  { feature: 'Driver Rating Tier (1-4)', importance: 0.010196, category: 'Risk Rating', group: 'Driver' },
  { feature: 'Vehicle Price: >$69,000', importance: 0.008701, category: 'Vehicle Value', group: 'Vehicle' }
];
