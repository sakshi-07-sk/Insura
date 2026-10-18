import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  Scale, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Info,
  PieChart,
  Gauge,
  SearchCheck,
  FileText
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
import { api } from '../services/api';

const METRICS_DATA = {
  model_name: "RandomForestClassifier",
  optimal_threshold: 0.61,
  default_threshold: 0.50,
  roc_auc: 0.8473,
  pr_auc: 0.2408,
  baseline_prevalence: 0.0601,
  optimal_metrics: {
    precision: 0.2061,
    recall: 0.5324,
    f1_score: 0.2972,
    accuracy: 0.8487,
    fast_tracked_pct: 86.89,
    fraud_detected_pct: 53.24,
    confusion_matrix: {
      tn: 1889,
      fp: 285,
      fn: 65,
      tp: 74,
      total: 2313
    }
  },
  default_metrics: {
    precision: 0.1440,
    recall: 0.8849,
    f1_score: 0.2477,
    accuracy: 0.6770,
    fast_tracked_pct: 66.38,
    fraud_detected_pct: 88.49,
    confusion_matrix: {
      tn: 1443,
      fp: 731,
      fn: 16,
      tp: 123,
      total: 2313
    }
  }
};

const TOP_FEATURES = [
  { name: 'Fault: Third Party', importance: 0.1421, category: 'Fault' },
  { name: 'Fault: Policy Holder', importance: 0.1112, category: 'Fault' },
  { name: 'Base Policy: Liability', importance: 0.0742, category: 'Policy' },
  { name: 'Policy: Sedan - Liability', importance: 0.0738, category: 'Policy' },
  { name: 'Vehicle: Sport Category', importance: 0.0528, category: 'Vehicle' },
  { name: 'Vehicle: Sedan Category', importance: 0.0431, category: 'Vehicle' },
  { name: 'Driver Age (Years)', importance: 0.0276, category: 'Demographic' },
  { name: 'Base Policy: Collision', importance: 0.0227, category: 'Policy' },
  { name: 'Base Policy: All Perils', importance: 0.0208, category: 'Policy' },
  { name: 'Address Change: 2-3 yrs', importance: 0.0192, category: 'Claimant' },
  { name: 'Deductible Amount ($)', importance: 0.0192, category: 'Financial' },
  { name: 'Policy Inception Year', importance: 0.0174, category: 'Temporal' }
];

export function AnalystDashboardPage() {
  const [selectedThreshold, setSelectedThreshold] = useState('optimal'); // optimal (0.61) vs default (0.50)
  const [liveInfo, setLiveInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const curMetrics = selectedThreshold === 'optimal' ? METRICS_DATA.optimal_metrics : METRICS_DATA.default_metrics;
  const cm = curMetrics.confusion_matrix;

  const location = useLocation();
  const currentPath = location.pathname;
  const isDistributionView = currentPath === '/analyst/distribution';
  const isPerformanceView = currentPath === '/analyst/performance';
  const isTrendsView = currentPath === '/analyst/trends';
  const isFalsePositivesView = currentPath === '/analyst/false-positives';
  const isFairnessView = currentPath === '/analyst/fairness';
  const isReportsView = currentPath === '/analyst/reports';
  const isOverview = !isDistributionView && !isPerformanceView && !isTrendsView && !isFalsePositivesView && !isFairnessView && !isReportsView;

  useEffect(() => {
    api.getModelInfo().then(setLiveInfo).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isDistributionView ? 'Claim Risk Score Distribution & Buckets' :
               isPerformanceView ? 'Model Performance & PR-AUC Evaluation' :
               isTrendsView ? 'Fraud Trends & Anomaly Insights' :
               isFalsePositivesView ? 'False Positive & Fast-Track Analysis' :
               isFairnessView ? 'Model Fairness, Bias & Demographic Parity' :
               isReportsView ? 'Model Governance & Validation Reports' :
               'Model Performance & Risk Analytics'}
            </h1>
            <span style={{ 
              background: 'rgba(139, 92, 246, 0.15)', 
              color: '#8b5cf6', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(139, 92, 246, 0.3)' 
            }}>
              Risk Analyst Role
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            PR-AUC evaluation, decision boundary tuning, confusion matrix breakdown, and feature attribution
          </p>
        </div>

        {/* Threshold Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '8px' }}>Threshold:</span>
          <button
            onClick={() => setSelectedThreshold('optimal')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: selectedThreshold === 'optimal' ? '#8b5cf6' : 'transparent',
              color: selectedThreshold === 'optimal' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            0.61 (Cost-Optimal)
          </button>
          <button
            onClick={() => setSelectedThreshold('default')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: selectedThreshold === 'default' ? '#8b5cf6' : 'transparent',
              color: selectedThreshold === 'default' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            0.50 (Standard)
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { path: '/analyst/dashboard', label: 'Overview', icon: Layers },
          { path: '/analyst/distribution', label: 'Distribution', icon: PieChart },
          { path: '/analyst/performance', label: 'Performance', icon: Gauge },
          { path: '/analyst/trends', label: 'Trends', icon: TrendingUp },
          { path: '/analyst/false-positives', label: 'False Positives', icon: SearchCheck },
          { path: '/analyst/fairness', label: 'Fairness & Bias', icon: Scale },
          { path: '/analyst/reports', label: 'Model Reports', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path || (tab.path === '/analyst/dashboard' && isOverview);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? '#8b5cf6' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            ROC-AUC Score
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {(METRICS_DATA.roc_auc * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Excellent class separation
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            PR-AUC Score
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#8b5cf6' }}>
            {(METRICS_DATA.pr_auc * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            4.0x lift over 6.0% baseline
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            Genuine Fast-Track Rate
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {curMetrics.fast_tracked_pct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            1,889 claims auto-cleared
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            Fraud Caught (Recall)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4' }}>
            {curMetrics.fraud_detected_pct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Precision: {(curMetrics.precision * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Two Column Grid: Confusion Matrix & Feature Importance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px' }}>
        {/* Confusion Matrix */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Confusion Matrix (Test Set: {cm.total} Claims)
            </h3>
            <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600 }}>
              Threshold: {selectedThreshold === 'optimal' ? '0.61' : '0.50'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '12px', marginTop: '12px' }}>
            {/* True Negatives */}
            <div style={{
              padding: '18px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                True Negatives (TN)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
                {cm.tn.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Genuine claims correctly fast-tracked for payout
              </div>
            </div>

            {/* False Positives */}
            <div style={{
              padding: '18px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                False Positives (FP)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
                {cm.fp.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Genuine claims routed to SIU for manual verification
              </div>
            </div>

            {/* False Negatives */}
            <div style={{
              padding: '18px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                False Negatives (FN)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444' }}>
                {cm.fn.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fraud claims that evaded threshold detection
              </div>
            </div>

            {/* True Positives */}
            <div style={{
              padding: '18px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                True Positives (TP)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#06b6d4' }}>
                {cm.tp.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fraud cases successfully intercepted & investigated
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importance Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Top Feature Importances (RandomForest Gini)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Top 12 of 140 Features
            </span>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={TOP_FEATURES}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 0.16]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{data.name}</div>
                          <div style={{ fontSize: '11px', color: '#06b6d4' }}>Importance: {(data.importance * 100).toFixed(2)}%</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Category: {data.category}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {TOP_FEATURES.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index < 2 ? '#06b6d4' : index < 6 ? '#3b82f6' : '#8b5cf6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Responsible AI & Fairness Review Banner */}
      <div 
        style={{
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={20} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            IBM Responsible AI & Fairness Review
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          In accordance with IBM AI Fairness 360 guidelines, sensitive demographic features (gender, age bracket) were audited for disparate impact. The algorithm exhibits balanced prediction parity across demographics. Under the Insura operational charter, <strong>AI predictions only trigger human investigation</strong> and are never permitted to autonomously deny claims.
        </p>
      </div>
    </div>
  );
}
