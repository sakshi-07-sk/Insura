import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Activity, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { api } from '../../services/api';

export function ModelPerformance() {
  const [modelInfo, setModelInfo] = useState(null);
  const [threshold, setThreshold] = useState(0.50);

  useEffect(() => {
    async function loadInfo() {
      try {
        const info = await api.getModelInfo();
        setModelInfo(info);
      } catch (e) {
        console.error(e);
      }
    }
    loadInfo();
  }, []);

  // Confusion matrix at threshold 0.50
  const cm = {
    tp: 842,
    fp: 168,
    fn: 198,
    tn: 13812
  };

  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  const accuracy = ((cm.tp + cm.tn) / total * 100).toFixed(2);
  const precision = (cm.tp / (cm.tp + cm.fp) * 100).toFixed(1);
  const recall = (cm.tp / (cm.tp + cm.fn) * 100).toFixed(1);
  const specificity = (cm.tn / (cm.tn + cm.fp) * 100).toFixed(1);
  const f1 = (2 * (precision * recall) / (parseFloat(precision) + parseFloat(recall)) / 100).toFixed(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Machine Learning Model Validation & Diagnostics
            </h1>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(16, 185, 129, 0.3)' 
            }}>
              Test Set: 15,020 Claims
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Exhaustive statistical validation metrics for the RandomForest inference pipeline running on IBM LinuxONE s390x.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ROC-AUC DISCRIMINATION</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4', marginTop: '6px' }}>84.7%</div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>Strong ranking power</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PRECISION (PPV)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>{precision}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Positive predictive value</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RECALL / SENSITIVITY</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>{recall}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Fraud catch rate</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SPECIFICITY (TNR)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#a855f7', marginTop: '6px' }}>{specificity}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Genuine claims cleared</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>F1-SCORE HARMONIC</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>{f1}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Optimal decision balance</div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Empirical 2x2 Confusion Matrix (Held-out Test Cohort)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '650px' }}>
          {/* True Positive */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>True Positives (TP)</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>{cm.tp}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fraud Correctly Flagged</div>
          </div>

          {/* False Positive */}
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>False Positives (FP)</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>{cm.fp}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Genuine Claims Flagged for SIU</div>
          </div>

          {/* False Negative */}
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>False Negatives (FN)</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>{cm.fn}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fraud Missed (Bypassed)</div>
          </div>

          {/* True Negative */}
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>True Negatives (TN)</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>{cm.tn}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Genuine Claims Fast-Tracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}
