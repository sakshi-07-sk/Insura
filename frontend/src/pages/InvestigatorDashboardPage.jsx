import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  UserCheck, 
  ArrowRight, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  Eye
} from 'lucide-react';
import { api, getReviewerId } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/common/Badge';

export function InvestigatorDashboardPage() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL_FLAGGED'); // ALL_FLAGGED, PENDING, UNDER_REVIEW, ESCALATED
  const [selectedCase, setSelectedCase] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('UNDER_REVIEW');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        api.getClaims({ page: 1, page_size: 50 }),
        api.getDashboardStats()
      ]);
      
      // Filter for claims that warrant SIU scrutiny: HIGH, MEDIUM, or already flagged
      const flagged = (claimsRes.claims || []).filter(c => 
        c.risk_category === 'HIGH' || 
        c.risk_category === 'MEDIUM' || 
        c.review_status === 'ESCALATED' ||
        c.review_status === 'UNDER_REVIEW'
      ).sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

      setClaims(flagged);
      setStats(statsRes);
      if (flagged.length > 0 && !selectedCase) {
        setSelectedCase(flagged[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setReviewNotes(c.notes || '');
    setTargetStatus(c.review_status === 'PENDING_REVIEW' ? 'UNDER_REVIEW' : c.review_status);
    setReviewSuccess('');
  };

  const handleExecuteDecision = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setSubmittingReview(true);
    setReviewSuccess('');

    try {
      const reviewer = getReviewerId() || 'SIU_Elena_Rostova';
      const updated = await api.updateClaimReviewStatus(
        selectedCase.claim_id,
        targetStatus,
        reviewNotes,
        reviewer
      );

      setReviewSuccess(`Case ${selectedCase.claim_id} successfully updated to ${targetStatus}`);
      setSelectedCase(updated);
      
      // Update local claims queue
      setClaims(prev => prev.map(c => c.claim_id === updated.claim_id ? updated : c));
      
      // Refresh global stats
      api.getDashboardStats().then(setStats).catch(() => {});
    } catch (err) {
      alert(`Error updating review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredQueue = claims.filter(c => {
    if (activeTab === 'PENDING') return c.review_status === 'PENDING_REVIEW';
    if (activeTab === 'UNDER_REVIEW') return c.review_status === 'UNDER_REVIEW';
    if (activeTab === 'ESCALATED') return c.review_status === 'ESCALATED';
    return true; // ALL_FLAGGED
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Special Investigation Unit (SIU) Queue
            </h1>
            <span style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 8px', 
              borderRadius: '20px', 
              border: '1px solid rgba(239, 68, 68, 0.3)' 
            }}>
              Fraud Investigator Role
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Investigate suspicious claims, analyze contributing risk factors, and record legal audit determinations
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Sync Queue
        </button>
      </div>

      {/* SIU Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Suspicious Queue</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444' }}>
            {claims.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            High & Medium Risk Claims
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Formal SIU Escalations</span>
            <Flag size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b' }}>
            {claims.filter(c => c.review_status === 'ESCALATED').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Referred for legal / field audit
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Cleared Legitimate Claims</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {stats?.review_status_distribution?.CLEARED || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            False positives cleared by SIU
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Fraud Prevalence Rate</span>
            <Clock size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4' }}>
            6.01%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Empirical ground truth baseline
          </div>
        </div>
      </div>

      {/* Two-Pane Workspace: Left Queue, Right Dossier */}
      <div className="siu-workspace-grid">
        {/* Left: Flagged Claims Queue */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'ALL_FLAGGED', label: 'All Cases' },
              { id: 'PENDING', label: 'Unreviewed' },
              { id: 'UNDER_REVIEW', label: 'Auditing' },
              { id: 'ESCALATED', label: 'Escalated' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-light)',
                  background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-app)',
                  color: activeTab === tab.id ? '#060b14' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '640px', overflowY: 'auto' }}>
            {filteredQueue.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No flagged claims in this category.
              </div>
            ) : (
              filteredQueue.map(c => {
                const isSelected = selectedCase?.claim_id === c.claim_id;
                return (
                  <div
                    key={c.claim_id}
                    onClick={() => handleSelectCase(c)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-app)',
                      border: `1px solid ${isSelected ? '#06b6d4' : 'var(--border-light)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {c.claim_id}
                      </span>
                      <RiskBadge category={c.risk_category} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{c.features?.Make || 'Vehicle'} • {c.features?.VehicleCategory || 'Auto'}</span>
                      <span style={{ fontWeight: 700, color: c.risk_score > 0.61 ? '#ef4444' : '#f59e0b' }}>
                        Score: {((c.risk_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border-light)' }}>
                      <StatusBadge status={c.review_status || 'PENDING_REVIEW'} />
                      <span style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        Inspect <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Case Dossier & Human Decisioning Panel */}
        {selectedCase ? (
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Dossier Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Case Dossier: {selectedCase.claim_id}
                  </h2>
                  <RiskBadge category={selectedCase.risk_category} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  AI Predicted Risk: <strong style={{ color: selectedCase.risk_score > 0.61 ? '#ef4444' : '#f59e0b' }}>{((selectedCase.risk_score || 0) * 100).toFixed(1)}%</strong> | Model Threshold: 61.0%
                </div>
              </div>
              <StatusBadge status={selectedCase.review_status || 'PENDING_REVIEW'} />
            </div>

            {/* Risk Factor Breakdown Card */}
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#f59e0b" />
                Detected Anomalies & Contributing Factors
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Fault Determination: </span>
                  <strong style={{ color: selectedCase.features?.Fault === 'Third Party' ? '#ef4444' : 'var(--text-primary)' }}>
                    {selectedCase.features?.Fault || 'Unknown'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle Type: </span>
                  <strong>{selectedCase.features?.Make} ({selectedCase.features?.VehicleCategory})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Past Claims: </span>
                  <strong style={{ color: selectedCase.features?.PastNumberOfClaims !== 'none' ? '#f59e0b' : 'var(--text-primary)' }}>
                    {selectedCase.features?.PastNumberOfClaims || 'none'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Policy Coverage: </span>
                  <strong>{selectedCase.features?.BasePolicy || 'Sedan'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Address Change: </span>
                  <strong>{selectedCase.features?.AddressChange_Claim || 'no change'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Driver Age: </span>
                  <strong>{selectedCase.features?.Age || 35} yrs</strong>
                </div>
              </div>
            </div>

            {/* Action Decision Form */}
            <form onSubmit={handleExecuteDecision} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Investigator Determination
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'UNDER_REVIEW', label: 'Under Review', color: '#06b6d4' },
                    { id: 'CLEARED', label: 'Clear (Genuine)', color: '#10b981' },
                    { id: 'ESCALATED', label: 'Escalate to SIU', color: '#ef4444' }
                  ].map(statusOpt => (
                    <button
                      key={statusOpt.id}
                      type="button"
                      onClick={() => setTargetStatus(statusOpt.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${targetStatus === statusOpt.id ? statusOpt.color : 'var(--border-light)'}`,
                        background: targetStatus === statusOpt.id ? `${statusOpt.color}20` : 'var(--bg-app)',
                        color: targetStatus === statusOpt.id ? statusOpt.color : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {statusOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Investigator Audit Notes (Mandatory for Compliance)
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verification steps, claimant interviews, witness statements, and legal rationale..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {reviewSuccess && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: submittingReview ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  <Send size={15} />
                  {submittingReview ? 'Recording Audit...' : 'Commit Determination to Database'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a case from the queue to view dossier
          </div>
        )}
      </div>

      <style>{`
        .siu-workspace-grid {
          display: grid;
          grid-template-columns: minmax(320px, 1fr) minmax(440px, 1.4fr);
          gap: 20px;
        }
        @media (max-width: 960px) {
          .siu-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
