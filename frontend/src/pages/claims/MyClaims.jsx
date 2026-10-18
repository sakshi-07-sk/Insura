import React, { useState, useEffect } from 'react';
import { 
  FileStack, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function MyClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClaims = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getClaims({ limit: 50 });
      if (data && data.claims) {
        setClaims(data.claims);
      }
    } catch (err) {
      console.error('Failed to fetch claims', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter(c => {
    const claimId = (c.claim_id || c.id || '').toLowerCase();
    const name = (c.policy_holder_name || c.features?.PolicyHolderName || '').toLowerCase();
    const make = (c.features?.Make || '').toLowerCase();
    const matchesSearch = claimId.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase()) || make.includes(searchTerm.toLowerCase());

    const score = c.risk_score || c.fraud_score || 0;
    let matchesRisk = true;
    if (riskFilter === 'LOW') matchesRisk = score < 0.30;
    else if (riskFilter === 'MEDIUM') matchesRisk = score >= 0.30 && score < 0.70;
    else if (riskFilter === 'HIGH') matchesRisk = score >= 0.70;

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      matchesStatus = (c.review_status || 'PENDING') === statusFilter;
    }

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const exportClaimsCSV = () => {
    const headers = ['Claim ID', 'Policy Holder', 'Make', 'Vehicle Category', 'Risk Score', 'Risk Level', 'Review Status', 'Submitted Date'];
    const rows = filteredClaims.map(c => [
      c.claim_id || c.id,
      `"${c.policy_holder_name || c.features?.PolicyHolderName || 'Insured Client'}"`,
      c.features?.Make || 'N/A',
      c.features?.VehicleCategory || 'N/A',
      (c.risk_score || c.fraud_score || 0).toFixed(4),
      (c.risk_score || c.fraud_score || 0) < 0.30 ? 'LOW' : ((c.risk_score || c.fraud_score || 0) >= 0.70 ? 'HIGH' : 'MEDIUM'),
      c.review_status || 'PENDING',
      c.created_at || 'Recent'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `my_claims_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Officer Claims Portfolio
            </h1>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#3b82f6', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(59, 130, 246, 0.3)' 
            }}>
              {filteredClaims.length} Claims
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Search, filter, inspect, and track resolution statuses across all claims in your portfolio.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportClaimsCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '10px 14px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            to="/claims/submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <PlusCircle size={15} /> New Claim
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search by Claim ID, policyholder name, or vehicle make..."
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
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Fast-Track (Low &lt; 30%)</option>
            <option value="MEDIUM">Standard (30% - 70%)</option>
            <option value="HIGH">SIU Flagged (&ge; 70%)</option>
          </select>

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
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CLEARED">Cleared / Fast-Tracked</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
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
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>ACCIDENT DATE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>DECISION / STATUS</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No claims found matching current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const score = claim.risk_score || claim.fraud_score || 0;
                  const isLow = score < 0.30;
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
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                        {claim.claim_id || claim.id}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {claim.policy_holder_name || claim.features?.PolicyHolderName || 'Insured Client'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {claim.features?.Make || 'Toyota'} {claim.features?.VehicleCategory || 'Sedan'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                        {claim.features?.Month || 'Jan'} / {claim.features?.DayOfWeek || 'Mon'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            background: isLow ? 'rgba(16, 185, 129, 0.15)' : (isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'), 
                            color: isLow ? '#10b981' : (isHigh ? '#ef4444' : '#f59e0b'), 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 700 
                          }}>
                            {isLow ? 'LOW' : (isHigh ? 'HIGH' : 'MEDIUM')} ({(score * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 600,
                          color: claim.review_status === 'CLEARED' ? '#10b981' : (claim.review_status === 'ESCALATED' ? '#ef4444' : '#f59e0b') 
                        }}>
                          {claim.review_status || (isLow ? 'FAST_TRACKED' : 'PENDING')}
                        </span>
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
                          View Details
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
          onUpdate={fetchClaims}
        />
      )}
    </div>
  );
}
