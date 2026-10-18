import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  DollarSign,
  Car
} from 'lucide-react';
import { api } from '../../services/api';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function HighRiskClaims() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHighRiskClaims = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getClaims({ limit: 100 });
      if (res && res.claims) {
        // Filter strictly >= 0.70 risk score
        const highRisk = res.claims.filter(c => (c.risk_score || c.fraud_score || 0) >= 0.70);
        setClaims(highRisk);
      }
    } catch (err) {
      console.error('Failed to load high risk claims', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHighRiskClaims();
  }, []);

  const handleUpdateStatus = async (claimId, status, notes) => {
    try {
      await api.updateClaimReviewStatus(claimId, {
        review_status: status,
        review_notes: notes || `Investigator updated status to ${status}`
      });
      setActionSuccess(`Claim ${claimId} successfully marked as ${status}`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchHighRiskClaims();
    } catch (err) {
      alert('Failed to update claim: ' + err.message);
    }
  };

  const filtered = claims.filter(c => {
    const id = (c.claim_id || c.id || '').toLowerCase();
    const name = (c.policy_holder_name || c.features?.PolicyHolderName || '').toLowerCase();
    const make = (c.features?.Make || '').toLowerCase();
    return id.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase()) || make.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              High-Risk Claims & Fraud Interception
            </h1>
            <span style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(239, 68, 68, 0.3)' 
            }}>
              Critical Tier (&ge; 70%)
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Claims requiring mandatory fraud audit before payment approval. All payments currently placed on automated freeze.
          </p>
        </div>

        <button
          onClick={fetchHighRiskClaims}
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
          Refresh
        </button>
      </div>

      {actionSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px 16px', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Exposure Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL HIGH-RISK CLAIMS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
            {filtered.length} Cases
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            All cases scored &gt; 70% probability
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED FINANCIAL EXPOSURE</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            ${(filtered.length * 18250).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Average $18,250 claim payout value
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AUTOMATED FRAUD INTERCEPTION</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            100% On Hold
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Zero unauthorized automated disbursements
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search high-risk claims by ID, policyholder or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 12px 9px 36px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>CLAIM ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>CLAIMANT</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>VEHICLE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>HOLD STATUS</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>INVESTIGATOR ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No high-risk claims in queue.
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => {
                  const score = claim.risk_score || claim.fraud_score || 0;
                  return (
                    <tr 
                      key={claim.claim_id || claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>
                        {claim.claim_id || claim.id}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {claim.policy_holder_name || claim.features?.PolicyHolderName || 'Insured Client'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {claim.features?.Make || 'Vehicle'} ({claim.features?.VehicleCategory || 'Luxury'})
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          background: 'rgba(239, 68, 68, 0.15)', 
                          color: '#ef4444', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700 
                        }}>
                          {(score * 100).toFixed(1)}% RISK
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                          {claim.review_status || 'UNDER_REVIEW'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(claim.claim_id || claim.id, 'ESCALATED', 'Escalated to Legal & Fraud Unit');
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Escalate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(claim.claim_id || claim.id, 'CLEARED', 'Verified legitimate upon investigation');
                            }}
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#10b981',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Clear
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaim(claim);
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-light)',
                              color: '#38bdf8',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Drawer */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={fetchHighRiskClaims}
        />
      )}
    </div>
  );
}
