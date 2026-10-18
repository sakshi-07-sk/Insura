import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  ArrowUpDown, 
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function InvestigationQueue() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_desc');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClaims = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getClaims({ limit: 100 });
      if (res && res.claims) {
        setClaims(res.claims);
      }
    } catch (err) {
      console.error('Failed to load investigation queue', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const queueClaims = claims.filter(c => {
    const score = c.risk_score || c.fraud_score || 0;
    const matchesSearch = 
      (c.claim_id || c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.policy_holder_name || c.features?.PolicyHolderName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.features?.Make || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTier = true;
    if (tierFilter === 'HIGH') matchesTier = score >= 0.70;
    else if (tierFilter === 'MEDIUM') matchesTier = score >= 0.30 && score < 0.70;
    else if (tierFilter === 'ACTIVE') matchesTier = c.review_status === 'UNDER_REVIEW';

    return matchesSearch && matchesTier;
  });

  const sortedClaims = [...queueClaims].sort((a, b) => {
    const scoreA = a.risk_score || a.fraud_score || 0;
    const scoreB = b.risk_score || b.fraud_score || 0;
    if (sortBy === 'risk_desc') return scoreB - scoreA;
    if (sortBy === 'risk_asc') return scoreA - scoreB;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              SIU Investigation Triage Queue
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
              {sortedClaims.length} Cases in Queue
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Central triage of suspicious, flagged, and manually referred insurance claims awaiting investigator action.
          </p>
        </div>

        <button
          onClick={loadClaims}
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
          Refresh Queue
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search queue by Claim ID, policyholder or vehicle..."
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          >
            <option value="ALL">All Queue Items</option>
            <option value="HIGH">Priority 1 (Risk &ge; 70%)</option>
            <option value="MEDIUM">Priority 2 (Risk 30% - 70%)</option>
            <option value="ACTIVE">Under Active Review</option>
          </select>

          <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          >
            <option value="risk_desc">Risk: Highest First</option>
            <option value="risk_asc">Risk: Lowest First</option>
            <option value="date_desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
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
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>POLICY HOLDER</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>VEHICLE ASSET</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>ANOMALY TAGS</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>REVIEW STATUS</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {sortedClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pending cases found matching the criteria.
                  </td>
                </tr>
              ) : (
                sortedClaims.map((claim) => {
                  const score = claim.risk_score || claim.fraud_score || 0;
                  const isHigh = score >= 0.70;

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
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: isHigh ? '#ef4444' : '#38bdf8' }}>
                        {claim.claim_id || claim.id}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {claim.policy_holder_name || claim.features?.PolicyHolderName || 'Insured Client'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {claim.features?.Make || 'Vehicle'} ({claim.features?.VehicleCategory || 'Sedan'})
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          background: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                          color: isHigh ? '#ef4444' : '#f59e0b', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700 
                        }}>
                          {(score * 100).toFixed(1)}% {isHigh ? 'CRITICAL' : 'EVALUATE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {claim.features?.PoliceReportFiled === 'No' && (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>No Police Report</span>
                          )}
                          {claim.features?.Fault === 'Policy Holder' && (
                            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>At Fault</span>
                          )}
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>LinuxONE Scored</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: claim.review_status === 'ESCALATED' ? '#ef4444' : (claim.review_status === 'CLEARED' ? '#10b981' : '#f59e0b') }}>
                          {claim.review_status || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim); }}
                          style={{
                            background: isHigh ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isHigh ? 'rgba(239,68,68,0.4)' : 'var(--border-light)'}`,
                            color: isHigh ? '#ef4444' : '#38bdf8',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Triage Dossier
                        </button>
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
          onUpdate={loadClaims}
        />
      )}
    </div>
  );
}
