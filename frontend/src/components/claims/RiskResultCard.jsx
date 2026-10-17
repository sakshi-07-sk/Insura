import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  FileCheck2,
  Info
} from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export function RiskResultCard({ result, onReset, onViewInQueue, onOpenReview }) {
  if (!result) return null;

  const score = Number(result.risk_score || 0).toFixed(1);
  const prob = (Number(result.fraud_probability || 0) * 100).toFixed(1);
  const category = (result.risk_category || 'LOW').toUpperCase();

  const isHigh = category === 'HIGH';
  const isMed = category === 'MEDIUM';
  const isLow = category === 'LOW';

  const cardBorder = isHigh ? 'var(--risk-high-border)' : isMed ? 'var(--risk-med-border)' : 'var(--risk-low-border)';
  const headerBg = isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)';

  return (
    <div 
      className="card animate-fade-in" 
      style={{ 
        border: `2px solid ${cardBorder}`, 
        padding: 0, 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Result Header */}
      <div 
        style={{ 
          padding: '24px', 
          backgroundColor: headerBg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: `1px solid ${cardBorder}`,
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Claim Risk Assessment Result
            </span>
            <RiskBadge category={category} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Claim ID: {result.claim_id}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Model Version: <strong>{result.model_version || '1.0.0'}</strong> • Scored: {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'Just now'}
          </div>
        </div>

        {/* Big Numerical Score Indicator */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Calibrated Risk Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1, color: isHigh ? 'var(--risk-high-text)' : isMed ? 'var(--risk-med-text)' : 'var(--risk-low-text)' }}>
              {score}
            </span>
            <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
            Statistical Fraud Probability: <strong>{prob}%</strong>
          </div>
        </div>
      </div>

      {/* Meter Bar */}
      <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-subtle)' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${Math.min(100, Math.max(0, result.risk_score))}%`,
            backgroundColor: isHigh ? 'var(--risk-high-accent)' : isMed ? 'var(--risk-med-accent)' : 'var(--risk-low-accent)',
            transition: 'width 0.6s ease-out'
          }} 
        />
      </div>

      {/* Triage Guidance & Explanation */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Recommendation Box */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Next Step Recommendation
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isHigh && <AlertOctagon size={18} style={{ color: 'var(--risk-high-accent)' }} />}
              {isMed && <AlertTriangle size={18} style={{ color: 'var(--risk-med-accent)' }} />}
              {isLow && <ShieldCheck size={18} style={{ color: 'var(--risk-low-accent)' }} />}
              <span>
                {isHigh ? 'Priority Human Investigation (SIU)' :
                 isMed ? 'Standard Adjuster Verification' :
                 'Fast-Track Straight-Through Settlement'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
              {result.message || (isHigh 
                ? 'Elevated model-estimated risk exceeding 61.0 threshold. Claim flagged for priority manual audit.' 
                : 'Low model-estimated risk. Eligible for expedited straight-through settlement.')}
            </p>
          </div>

          {/* Operational Policy & Threshold Info */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Calibrated Decision Thresholds
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div>• <strong>Low Risk:</strong> &lt; 42.7 (Fast-Track)</div>
              <div>• <strong>Medium Risk:</strong> 42.7 to 60.9 (Standard)</div>
              <div>• <strong>High Risk:</strong> &ge; 61.0 (Audit Triage)</div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Status: <strong>{result.status || 'PENDING_REVIEW'}</strong>
            </div>
          </div>
        </div>

        {/* Ethical Non-Proof Disclaimer */}
        <div className="notice-disclaimer" style={{ margin: '16px 0' }}>
          <strong>DISCLAIMER:</strong> {result.disclaimer || 'AI-generated risk scores are decision-support indicators, not proof of fraud. Final claim decisions require appropriate human review.'}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onReset}
          >
            <RotateCcw size={14} />
            <span>Score Another Claim</span>
          </button>

          {onViewInQueue && (
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onViewInQueue}
            >
              <span>View in Claims Queue</span>
            </button>
          )}

          {onOpenReview && (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => onOpenReview(result.claim_id)}
            >
              <span>Open in Review Center</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
