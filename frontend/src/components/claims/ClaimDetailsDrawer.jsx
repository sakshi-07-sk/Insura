import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertOctagon, 
  Save, 
  Info
} from 'lucide-react';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { api, getReviewerId } from '../../services/api';
import { FEATURE_GROUPS, FEATURE_DEFINITIONS } from '../../data/featureSchema';

export function ClaimDetailsDrawer({ claim, onClose, onStatusUpdated }) {
  const [activeTab, setActiveTab] = useState('features'); // 'features', 'review'
  const [targetStatus, setTargetStatus] = useState(claim?.review_status || 'PENDING_REVIEW');
  const [reviewNotes, setReviewNotes] = useState(claim?.review_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  if (!claim) return null;

  const features = claim.features || {};

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const updated = await api.updateClaimReview(claim.claim_id, {
        review_status: targetStatus,
        reviewer_id: getReviewerId(),
        review_notes: reviewNotes
      });
      setActionSuccess(`Claim status updated to ${targetStatus}`);
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update review status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = claim.risk_score !== undefined ? Number(claim.risk_score).toFixed(1) : '—';
  const prob = claim.fraud_probability !== undefined ? (Number(claim.fraud_probability) * 100).toFixed(1) : '—';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-details-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 id="claim-details-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {claim.claim_id}
              </h2>
              <RiskBadge category={claim.risk_category} />
              <StatusBadge status={claim.review_status} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              External Ref: {claim.external_reference || 'None'} • Model Version: {claim.model_version || '1.0.0'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px' }}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Risk Score Summary Banner */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor:
              claim.risk_category === 'HIGH' ? 'var(--risk-high-bg)' :
              claim.risk_category === 'MEDIUM' ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
              AI Risk Assessment
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {score}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '12px' }}>
                Fraud Probability: {prob}%
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>
              {claim.risk_category === 'HIGH' ? 'Manual SIU Audit Recommended' :
               claim.risk_category === 'MEDIUM' ? 'Standard Review Required' : 'Eligible for Fast-Track Payout'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Threshold: 61.0 / 100
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px' }}>
          <button
            onClick={() => setActiveTab('features')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'features' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'features' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Claim Features ({Object.keys(features).length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'review' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'review' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Adjuster Review & Audit
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'features' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Features passed to Member 1's inference engine for real-time risk calibration. Sensitive demographic attributes are strictly excluded.
                </p>
              </div>

              {FEATURE_GROUPS.map((group) => (
                <div key={group.id} style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    fontSize: '13px', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)', 
                    marginBottom: '8px',
                    paddingBottom: '4px',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    {group.title}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {group.features.map((featKey) => {
                      const def = FEATURE_DEFINITIONS[featKey];
                      const val = features[featKey];
                      return (
                        <div 
                          key={featKey}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {def?.label || featKey}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {val !== undefined && val !== null ? String(val) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Ethical Exclusions Note */}
              <div className="notice-disclaimer" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                  <Info size={14} />
                  <span>Fairness & Responsible AI Governance</span>
                </div>
                The following attributes are strictly excluded from inference: <code>Sex</code>, <code>MaritalStatus</code>, <code>PolicyNumber</code>, <code>RepNumber</code>.
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div>
              {/* Prior Review Info */}
              <div className="card" style={{ marginBottom: '20px', backgroundColor: 'var(--bg-subtle)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Investigation History & Audit Trail
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Created At: </span>
                    <strong>{claim.created_at ? new Date(claim.created_at).toLocaleString() : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Last Updated: </span>
                    <strong>{claim.updated_at ? new Date(claim.updated_at).toLocaleString() : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Reviewed By: </span>
                    <strong>{claim.reviewed_by || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Reviewed At: </span>
                    <strong>{claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleString() : 'Pending'}</strong>
                  </div>
                </div>

                {claim.review_notes && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Previous Adjuster Notes:
                    </div>
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{claim.review_notes}"
                    </div>
                  </div>
                )}
              </div>

              {/* Update Review Form */}
              <form onSubmit={handleUpdateReview}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  Update Review Determination
                </h4>

                {actionSuccess && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--risk-low-bg)', color: 'var(--risk-low-text)', borderRadius: 'var(--radius-md)', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {actionError && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high-text)', borderRadius: 'var(--radius-md)', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertOctagon size={16} />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Target Review Status <span className="required-indicator">*</span>
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="PENDING_REVIEW">PENDING_REVIEW (Awaiting Initial Triage)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Active Investigation)</option>
                    <option value="CLEARED">CLEARED (Approved / Fast-Track Payout)</option>
                    <option value="ESCALATED">ESCALATED (Referred to Special Investigation Unit)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Investigator Notes & Payout Justification
                  </label>
                  <textarea
                    rows={4}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Provide justification for clearance or SIU escalation (e.g. Police accident report confirmed; dashcam verified damage)..."
                    className="form-control"
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Notes are persisted to the database audit record for compliance and regulatory reporting.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    <Save size={14} />
                    <span>{isSubmitting ? 'Saving Review...' : 'Commit Status Update'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Disclaimer footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}>
          Legal Notice: AI risk scores assist prioritization and must not be used to automatically deny claims without authorized adjuster review.
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
