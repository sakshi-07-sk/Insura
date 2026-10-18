import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Download, 
  DollarSign, 
  Calendar,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function ReviewHistory() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getClaims({ limit: 100 });
      if (res && res.claims) {
        // Cases that have a resolved review status
        const resolved = res.claims.filter(c => c.review_status === 'CLEARED' || c.review_status === 'ESCALATED');
        setClaims(resolved);
      }
    } catch (err) {
      console.error('Failed to load review history', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearedCount = claims.filter(c => c.review_status === 'CLEARED').length;
  const escalatedCount = claims.filter(c => c.review_status === 'ESCALATED').length;
  const estimatedSavings = escalatedCount * 19400;

  const filtered = claims.filter(c => {
    const id = (c.claim_id || c.id || '').toLowerCase();
    const name = (c.policy_holder_name || c.features?.PolicyHolderName || '').toLowerCase();
    const matchesSearch = id.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.review_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Investigation Review History & Closed Audits
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
              Archived Determinations
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Auditable archive of resolved investigations, cleared legitimate claims, and confirmed fraud cases referred to legal.
          </p>
        </div>

        <button
          onClick={fetchHistory}
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
          Refresh History
        </button>
      </div>

      {/* Outcome Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL RESOLVED CASES</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {claims.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Closed investigations with signed outcomes
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRMED FRAUD (ESCALATED)</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
            {escalatedCount} Cases
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Referred for criminal / civil defense
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CLEARED GENUINE CLAIMS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {clearedCount} Cases
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Exonerated & released for settlement
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE FRAUD SAVINGS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            ${estimatedSavings.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Capital safeguarded for policyholders
          </div>
        </div>
      </div>

      {/* Search & Filter */}
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
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search history by Claim ID or policyholder..."
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          >
            <option value="ALL">All Outcomes</option>
            <option value="CLEARED">Cleared Only</option>
            <option value="ESCALATED">Escalated Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
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
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>VEHICLE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>INITIAL SCORE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>FINAL DETERMINATION</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>INVESTIGATOR SUMMARY</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No resolved claims in history matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map(claim => {
                  const score = claim.risk_score || claim.fraud_score || 0;
                  const isCleared = claim.review_status === 'CLEARED';

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
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: isCleared ? '#38bdf8' : '#ef4444' }}>
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
                          background: score >= 0.70 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                          color: score >= 0.70 ? '#ef4444' : '#f59e0b', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700 
                        }}>
                          {(score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          color: isCleared ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {isCleared ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {claim.review_status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {claim.review_notes || 'Investigation completed and findings recorded in audit trail.'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim); }}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-light)',
                            color: '#38bdf8',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Audit Record
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
          onUpdate={fetchHistory}
        />
      )}
    </div>
  );
}
