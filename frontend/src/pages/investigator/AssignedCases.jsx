import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Save, 
  Send,
  RefreshCw,
  User,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function AssignedCases() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCases = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getClaims({ limit: 50 });
      if (res && res.claims) {
        // Cases under review
        const assigned = res.claims.filter(c => c.review_status === 'UNDER_REVIEW' || c.review_status === 'IN_PROGRESS' || (c.risk_score || c.fraud_score || 0) >= 0.50);
        setClaims(assigned);
        if (assigned.length > 0 && !selectedCase) {
          setSelectedCase(assigned[0]);
          setNotes(assigned[0].review_notes || '');
        }
      }
    } catch (err) {
      console.error('Failed to load assigned cases', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setNotes(c.review_notes || '');
    setSuccessMsg('');
  };

  const handleSaveDecision = async (status) => {
    if (!selectedCase) return;
    setIsSaving(true);
    try {
      await api.updateClaimReviewStatus(selectedCase.claim_id || selectedCase.id, {
        review_status: status,
        review_notes: notes
      });
      setSuccessMsg(`Case updated to ${status}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCases();
    } catch (err) {
      alert('Error updating case: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Active Case Investigation Workbench
            </h1>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(245, 158, 11, 0.3)' 
            }}>
              {claims.length} Cases Assigned
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Direct investigation workbench for assigned claim dossiers, evidence verification, and adjudication notes.
          </p>
        </div>

        <button
          onClick={fetchCases}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '10px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh Worklist
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px 16px', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* Left: Case List */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '750px'
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ASSIGNED CASES ({claims.length})
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {claims.map(c => {
              const score = c.risk_score || c.fraud_score || 0;
              const isSelected = selectedCase?.claim_id === c.claim_id || selectedCase?.id === c.id;

              return (
                <div
                  key={c.claim_id || c.id}
                  onClick={() => handleSelectCase(c)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #06b6d4' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>
                      {c.claim_id || c.id}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: score >= 0.70 ? '#ef4444' : '#f59e0b',
                      background: score >= 0.70 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {(score * 100).toFixed(0)}% RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginTop: '6px' }}>
                    {c.policy_holder_name || c.features?.PolicyHolderName || 'Insured Client'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.features?.Make || 'Vehicle'} • {c.review_status || 'UNDER_REVIEW'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Dossier & Decision Controls */}
        {selectedCase ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 700 }}>CASE DOSSIER</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '4px 0 0', fontFamily: 'monospace' }}>
                    {selectedCase.claim_id || selectedCase.id}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Policyholder: <strong style={{ color: '#ffffff' }}>{selectedCase.policy_holder_name || selectedCase.features?.PolicyHolderName || 'Insured Client'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned Status</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                    {selectedCase.review_status || 'UNDER_REVIEW'}
                  </div>
                </div>
              </div>

              {/* Key Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI RISK SCORE</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: (selectedCase.risk_score || selectedCase.fraud_score || 0) >= 0.70 ? '#ef4444' : '#f59e0b' }}>
                    {((selectedCase.risk_score || selectedCase.fraud_score || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VEHICLE CATEGORY</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                    {selectedCase.features?.Make || 'Vehicle'} ({selectedCase.features?.VehicleCategory || 'Sedan'})
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>POLICE REPORT FILED</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: selectedCase.features?.PoliceReportFiled === 'Yes' ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                    {selectedCase.features?.PoliceReportFiled || 'No'}
                  </div>
                </div>
              </div>

              {/* Case Notes Editor */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  <MessageSquare size={16} color="#06b6d4" /> Investigator Case Notes & Evidence Log
                </div>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview notes, body shop telemetry, witness corroboration, and fraud determination rationale..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  disabled={isSaving}
                  onClick={() => handleSaveDecision('ESCALATED')}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Fraud & Escalate to Legal
                </button>
                <button
                  disabled={isSaving}
                  onClick={() => handleSaveDecision('CLEARED')}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Clear & Approve Claim
                </button>
                <button
                  disabled={isSaving}
                  onClick={() => handleSaveDecision('UNDER_REVIEW')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-light)',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Notes Only
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a case from the worklist to inspect details.
          </div>
        )}
      </div>
    </div>
  );
}
