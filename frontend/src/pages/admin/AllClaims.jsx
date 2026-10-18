import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskBadge, StatusBadge } from '../../components/common/Badge';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function AllClaims() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClaims = async () => {
    setIsRefreshing(true);
    try {
      const [res, statsRes] = await Promise.allSettled([
        api.getClaims({ page: 1, page_size: 50 }),
        api.getDashboardStats()
      ]);
      if (res.status === 'fulfilled') setClaims(res.value.claims || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const filtered = claims.filter(c => {
    const matchesSearch = !searchTerm ||
      c.claim_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.features?.Make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.features?.PolicyType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || c.risk_category === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || c.review_status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const exportCSV = () => {
    if (claims.length === 0) return;
    const headers = ['Claim_ID', 'Make', 'Vehicle_Category', 'Vehicle_Price', 'Risk_Score', 'Risk_Category', 'Review_Status'];
    const rows = filtered.map(c => [
      c.claim_id,
      c.features?.Make || 'N/A',
      c.features?.VehicleCategory || 'N/A',
      c.features?.VehiclePrice || 'N/A',
      c.risk_score || 0,
      c.risk_category || 'LOW',
      c.review_status || 'PENDING_REVIEW'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `insura_claims_export_${Date.now()}.csv`);
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
              All Claims Governance Queue
            </h1>
            <span style={{ 
              background: 'rgba(6, 182, 212, 0.15)', 
              color: '#06b6d4', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(6, 182, 212, 0.3)' 
            }}>
              Master Intake
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Cross-organizational view of all claims, AI risk predictions, and human adjudication statuses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '10px 16px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            onClick={loadClaims}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '10px 14px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search Claim ID or Make..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: riskFilter === r ? '#06b6d4' : 'var(--bg-app)',
                    color: riskFilter === r ? '#060b14' : 'var(--text-muted)'
                  }}
                >
                  {r === 'ALL' ? 'All Risks' : r}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'PENDING_REVIEW', 'UNDER_REVIEW', 'CLEARED', 'ESCALATED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: statusFilter === s ? '#38bdf8' : 'var(--bg-app)',
                    color: statusFilter === s ? '#060b14' : 'var(--text-muted)'
                  }}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: '13px', color: '#06b6d4', fontWeight: 600 }}>
            {filtered.length} Claims Listed
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Vehicle & Policy</th>
                <th>Fault</th>
                <th>Risk Category</th>
                <th>AI Score</th>
                <th>Adjudication Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No claims match current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => (
                  <tr key={claim.claim_id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {claim.claim_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {claim.features?.Make || 'Toyota'} • {claim.features?.VehicleCategory || 'Sedan'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {claim.features?.PolicyType || 'Standard Liability'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {claim.features?.Fault || 'Policy Holder'}
                    </td>
                    <td>
                      <RiskBadge category={claim.risk_category} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${(claim.risk_score || 0) * 100}%`, 
                              height: '100%', 
                              background: (claim.risk_score || 0) > 0.61 ? '#ef4444' : (claim.risk_score || 0) > 0.35 ? '#f59e0b' : '#10b981' 
                            }} 
                          />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {((claim.risk_score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={claim.review_status || 'PENDING_REVIEW'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-light)',
                          color: '#06b6d4',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Details Drawer */}
      <ClaimDetailsDrawer
        claim={selectedClaim}
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
}
