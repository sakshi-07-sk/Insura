import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Info, 
  Server, 
  Scale, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  OFFLINE_MODEL_METADATA, 
  HELD_OUT_TEST_METRICS, 
  TOP_FEATURE_IMPORTANCES 
} from '../services/modelMetricsData';
import { api } from '../services/api';

export function ModelInsightsPage() {
  const [liveModelInfo, setLiveModelInfo] = useState(null);
  const [isLiveChecking, setIsLiveChecking] = useState(false);

  const fetchLiveInfo = async () => {
    setIsLiveChecking(true);
    setLiveError(null);
    try {
      const info = await api.getModelInfo();
      setLiveModelInfo(info);
    } catch (err) {
      setLiveError(err.message);
    } finally {
      setIsLiveChecking(false);
    }
  };

  useEffect(() => {
    fetchLiveInfo();
  }, []);

  const meta = OFFLINE_MODEL_METADATA;
  const testMetrics = HELD_OUT_TEST_METRICS;
  const cm = testMetrics.confusion_matrix;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Machine Learning Model Insights & Governance
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Empirical evaluation metrics, business impact trade-offs, and algorithmic fairness safeguards
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={fetchLiveInfo}
          disabled={isLiveChecking}
        >
          <RefreshCw size={14} style={{ animation: isLiveChecking ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isLiveChecking ? 'Querying Backend...' : 'Verify Live Model Status'}</span>
        </button>
      </div>

      {/* Mandatory Offline Distinction Alert */}
      <div 
        className="notice-disclaimer"
        style={{
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid var(--primary)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary-active)', fontSize: '13px' }}>
          <Info size={16} />
          <span>OFFLINE BENCHMARK TRANSPARENCY NOTICE</span>
        </div>
        <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          The performance metrics displayed on this page are derived from Member 1's rigorous <strong>offline held-out test split evaluation</strong> on 2,313 historical insurance claims. They reflect statistical benchmarking under imbalanced fraud prevalence (~6%), not live operational fraud catch rates.
        </p>
      </div>

      {/* Live Model Status Card */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: '#ffffff' }}>
        <div className="card-header">
          <div className="card-title">
            <Server size={18} style={{ color: 'var(--primary)' }} />
            <span>Active Inference Subsystem Status</span>
          </div>
          {liveModelInfo && (
            <span className="badge badge-low" style={{ textTransform: 'none' }}>
              Artifact Ready • v{liveModelInfo.model_version}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Architecture</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              IBM LinuxONE (`s390x`) / x86_64
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Algorithm Architecture</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Random Forest (150 trees, max_depth=12)
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Decision Threshold</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {liveModelInfo?.risk_thresholds?.high_threshold || meta.threshold_policy.selected_threshold} (61.0 / 100)
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Input Dimensions</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              28 Raw Features &rarr; 138 Encoded
            </div>
          </div>
        </div>
      </div>

      {/* Held-out Test Set KPI Cards */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
        Held-Out Test Set Performance (N = 2,313 Claims)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>ROC-AUC</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            {testMetrics.roc_auc.toFixed(4)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Discriminative ability
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PR-AUC</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0891b2', marginTop: '4px' }}>
            {testMetrics.pr_auc.toFixed(4)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Baseline prevalence: 0.060
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>FRAUD RECALL</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--risk-med-text)', marginTop: '4px' }}>
            {(testMetrics.recall * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fraud detected (64 / 138)
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PRECISION</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {(testMetrics.precision * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Flagged claims that were fraud
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>FAST-TRACK RATE</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--risk-low-text)', marginTop: '4px' }}>
            {testMetrics.business_impact.genuine_fast_tracked_pct}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Genuine claims expedited
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>INVESTIGATION RATE</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
            {testMetrics.business_impact.claims_flagged_for_investigation_pct}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Claims triaged to SIU
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Business Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Confusion Matrix Heatmap Representation */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              <span>Held-Out Test Set Confusion Matrix</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Threshold: 0.61</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
            {/* True Negative */}
            <div style={{ padding: '16px', backgroundColor: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--risk-low-text)' }}>TRUE NEGATIVES (TN)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--risk-low-text)', marginTop: '4px' }}>{cm.true_negatives}</div>
              <div style={{ fontSize: '11px', color: 'var(--risk-low-text)', marginTop: '4px' }}>Genuine claims fast-tracked</div>
            </div>

            {/* False Positive */}
            <div style={{ padding: '16px', backgroundColor: 'var(--risk-med-bg)', border: '1px solid var(--risk-med-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--risk-med-text)' }}>FALSE POSITIVES (FP)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--risk-med-text)', marginTop: '4px' }}>{cm.false_positives}</div>
              <div style={{ fontSize: '11px', color: 'var(--risk-med-text)', marginTop: '4px' }}>Genuine claims routed for review</div>
            </div>

            {/* False Negative */}
            <div style={{ padding: '16px', backgroundColor: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--risk-high-text)' }}>FALSE NEGATIVES (FN)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--risk-high-text)', marginTop: '4px' }}>{cm.false_negatives}</div>
              <div style={{ fontSize: '11px', color: 'var(--risk-high-text)', marginTop: '4px' }}>Fraud missed by model</div>
            </div>

            {/* True Positive */}
            <div style={{ padding: '16px', backgroundColor: '#eff6ff', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-active)' }}>TRUE POSITIVES (TP)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-active)', marginTop: '4px' }}>{cm.true_positives}</div>
              <div style={{ fontSize: '11px', color: 'var(--primary-active)', marginTop: '4px' }}>Fraud successfully flagged</div>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.4 }}>
            In highly imbalanced fraud triage (5.99% base rate), prioritizing precision vs recall is a deliberate business trade-off. Threshold 0.61 ensures <strong>86.7% of genuine claims</strong> are settled without unnecessary investigation delay.
          </p>
        </div>

        {/* Business Impact Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Scale size={18} style={{ color: 'var(--primary)' }} />
              <span>Operational Business Trade-Offs</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Genuine Claims Fast-Tracked</span>
                <strong style={{ color: 'var(--risk-low-text)' }}>86.7%</strong>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '86.7%', height: '100%', backgroundColor: 'var(--risk-low-accent)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Fraud Claims Intercepted</span>
                <strong style={{ color: 'var(--primary)' }}>46.4%</strong>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '46.4%', height: '100%', backgroundColor: 'var(--primary)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Adjuster Investigation Caseload</span>
                <strong>15.3% of Total Volume</strong>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '15.3%', height: '100%', backgroundColor: '#64748b' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <strong>Executive Takeaway:</strong> Rather than overwhelming adjusters with 100% manual audits, ClaimGuard AI isolates the top 15% riskiest submissions while clearing the vast majority of genuine customers for fast payouts.
          </div>
        </div>
      </div>

      {/* Feature Importance Bar Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
              <span>Top Machine Learning Feature Importances</span>
            </div>
            <div className="card-subtitle">
              Native Random Forest Gini relative weight ranking across 138 transformed dimensions
            </div>
          </div>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={TOP_FEATURE_IMPORTANCES.slice(0, 10)}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="feature" 
                tick={{ fontSize: 11, fill: '#334155' }} 
                width={120} 
              />
              <Tooltip 
                formatter={(val) => [`${(val * 100).toFixed(2)}% Relative Weight`, 'Model Importance']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="importance" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                {TOP_FEATURE_IMPORTANCES.slice(0, 10).map((entry, index) => (
                  <Cell 
                    key={`bar-${index}`} 
                    fill={index === 0 ? '#1e40af' : index === 1 ? '#2563eb' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="notice-disclaimer" style={{ marginTop: '12px' }}>
          <strong>Causation Disclaimer:</strong> Feature importances reflect statistical predictive association within historical training distributions. High feature importance <strong>does not establish legal causation</strong> or definitive proof of fraudulent intent.
        </div>
      </div>

      {/* Algorithmic Fairness & Responsible AI Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={18} style={{ color: 'var(--risk-low-accent)' }} />
            <span>Responsible AI & Demographic Bias Mitigation</span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          In accordance with insurance compliance regulations and Ethical AI standards, our pipeline enforces strict data governance:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>Excluded: Sex & Gender</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Eliminated to prevent discriminatory gender premiums and triage bias.
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>Excluded: Marital Status</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Removed to satisfy Fair Insurance Practices and anti-discrimination standards.
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>Excluded: Policy & Rep Numbers</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Excluded to prevent memorization/overfitting and adjuster assignment skew.
            </div>
          </div>
        </div>
      </div>

      {/* Model Limitations & Edge Cases */}
      <div className="card" style={{ border: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Known Model Limitations & Operational Constraints
        </h4>
        <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
          <li>
            <strong>Historical Label Skew:</strong> The model is trained on historical insurance settlement records. Claims historically coded as genuine may include undiscovered fraud, and labeled fraud cases may reflect historical audit focus.
          </li>
          <li>
            <strong>False Positives:</strong> Under the 0.61 threshold, approximately 13.3% of genuine claims will receive intermediate or elevated risk flags, requiring human review before clearance.
          </li>
          <li>
            <strong>False Negatives:</strong> Novel or sophisticated fraud rings not represented in historical feature distributions may receive low scores. Adjusters retain authority to audit any claim regardless of ML score.
          </li>
        </ul>
      </div>
    </div>
  );
}
