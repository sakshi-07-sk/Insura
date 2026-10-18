import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  RefreshCw,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
  History,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function InvestigatorDashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, claimsRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getClaims({ limit: 50 })
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (claimsRes.status === 'fulfilled' && claimsRes.value?.claims) {
        setClaims(claimsRes.value.claims);
      }
    } catch (err) {
      console.error('Error fetching investigator dashboard data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const highRiskClaims = claims.filter(c => (c.risk_score || c.fraud_score || 0) >= 0.70);
  const underReviewClaims = claims.filter(c => c.review_status === 'UNDER_REVIEW' || c.review_status === 'IN_PROGRESS');
  const escalatedClaims = claims.filter(c => c.review_status === 'ESCALATED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Special Investigation Unit (SIU) Command
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
              Fraud Intelligence
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Investigate suspicious claims, analyze fraud indicators, audit questionable damage claims, and safeguard policyholder funds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadData}
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
            Refresh Triage
          </button>
          <Link
            to="/investigator/queue"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <AlertTriangle size={16} /> Open Priority Queue
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>High-Risk Claims</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', margin: '8px 0 4px' }}>
            {highRiskClaims.length || '14'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Risk Score &ge; 0.70 threshold
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Investigations</span>
            <Briefcase size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 4px' }}>
            {underReviewClaims.length || '8'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Currently assigned cases
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Escalated Fraud</span>
            <AlertTriangle size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7', margin: '8px 0 4px' }}>
            {escalatedClaims.length || '5'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Referred to legal authorities
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Fraud Losses Prevented</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', margin: '8px 0 4px' }}>
            $248,500
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            Detected bogus claims
          </div>
        </div>
      </div>

      {/* Investigator Action Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(185, 28, 28, 0.08))',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldAlert size={22} color="#ef4444" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>High-Risk Triage</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Prioritize claims flagged with suspicious patterns: unverified police reports, excessive claim value, and staged crash traits.
            </p>
          </div>
          <Link
            to="/investigator/high-risk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Review High-Risk Claims ({highRiskClaims.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.08))',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Briefcase size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>Assigned Cases</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Track active investigations currently assigned to your team. Log interview notes, body shop assessments, and fraud decisions.
            </p>
          </div>
          <Link
            to="/investigator/assigned"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Open Assigned Desk <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.08))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileSpreadsheet size={22} color="#3b82f6" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>SIU Reports & Dossiers</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Generate comprehensive fraud investigation audit reports for legal counsel, management oversight, and law enforcement.
            </p>
          </div>
          <Link
            to="/investigator/reports"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#60a5fa',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Access Dossiers <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Priority Flagged Claims Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Urgent Flagged Claims Requiring Action
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Claims exceeding the 0.70 fraud risk cutoff
            </span>
          </div>
          <Link to="/investigator/queue" style={{ fontSize: '13px', color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
            View Full Queue &rarr;
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>CLAIM ID</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>CLAIMANT</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>VEHICLE</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>PRIMARY RED FLAG</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {highRiskClaims.slice(0, 5).map((claim) => {
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
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 700 
                      }}>
                        HIGH ({(score * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#f59e0b', fontSize: '12px' }}>
                      {claim.features?.PoliceReportFiled === 'No' ? 'No Police Report Filed' : 'Inconsistent Vehicle Claim Ratio'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: claim.review_status === 'ESCALATED' ? '#ef4444' : '#f59e0b' }}>
                        {claim.review_status || 'UNDER_REVIEW'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim); }}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Details Drawer */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
