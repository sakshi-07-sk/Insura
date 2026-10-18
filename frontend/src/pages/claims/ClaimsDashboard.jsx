import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  FileStack,
  ShieldCheck,
  Search,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClaimDetailsDrawer } from '../../components/claims/ClaimDetailsDrawer';

export function ClaimsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, claimsRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getClaims({ limit: 10 })
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (claimsRes.status === 'fulfilled' && claimsRes.value?.claims) {
        setRecentClaims(claimsRes.value.claims);
      }
    } catch (err) {
      console.error('Failed to load claims dashboard data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fastTrackCount = recentClaims.filter(c => (c.risk_score || c.fraud_score || 0) < 0.30).length;
  const reviewCount = recentClaims.filter(c => (c.risk_score || c.fraud_score || 0) >= 0.30 && (c.risk_score || c.fraud_score || 0) < 0.70).length;
  const flaggedCount = recentClaims.filter(c => (c.risk_score || c.fraud_score || 0) >= 0.70).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Claims Intake & Operations Hub
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
              Officer Workspace
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Welcome back, {user?.full_name || 'Claims Officer'}. Manage policyholder claims, trigger instant AI risk scoring, and track settlement pipelines.
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
            Refresh
          </button>
          <Link
            to="/claims/submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <PlusCircle size={16} /> Submit New Claim
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Claims Processed</span>
            <FileStack size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '8px 0 4px' }}>
            {stats?.total_claims || recentClaims.length || '1,420'}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> +14.2% from last month
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Fast-Track Approvals</span>
            <Zap size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', margin: '8px 0 4px' }}>
            {stats?.low_risk_claims || fastTrackCount || '892'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Instant payout (&lt; 0.30 risk)
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Standard Verification</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 4px' }}>
            {stats?.medium_risk_claims || reviewCount || '384'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Manual adjuster checks
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>SIU Hold Queue</span>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', margin: '8px 0 4px' }}>
            {stats?.high_risk_claims || flaggedCount || '144'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Escalated to Fraud Unit
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Workflows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.08))',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <PlusCircle size={22} color="#06b6d4" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>New Claim Intake</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Enter claim features, policy details, and vehicle telemetry. The ML model will score risk in ~18ms and determine approval path.
            </p>
          </div>
          <Link
            to="/claims/submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Launch Intake Wizard <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileCheck2 size={22} color="#10b981" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>Track Lifecycle Status</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Check real-time adjudication status for policyholders, download formal clearance letters, or review claim progression.
            </p>
          </div>
          <Link
            to="/claims/status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Open Status Pipeline <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.08))',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileStack size={22} color="#8b5cf6" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#ffffff' }}>My Active Portfolio</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              View and filter all claims filed under your adjuster ID. Review pending documentation and claimant replies.
            </p>
          </div>
          <Link
            to="/claims/my-claims"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            View Portfolio <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Claims Table */}
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
              Recent Claims Intake
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Latest claims scored by the LinuxONE inference engine
            </span>
          </div>
          <Link to="/claims/my-claims" style={{ fontSize: '13px', color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            View All Claims &rarr;
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>CLAIM ID</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>POLICY HOLDER</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>MAKE & VEHICLE</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.slice(0, 6).map((claim) => {
                const score = claim.risk_score || claim.fraud_score || 0;
                let riskBadge = { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', label: 'LOW' };
                if (score >= 0.70) {
                  riskBadge = { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'HIGH' };
                } else if (score >= 0.30) {
                  riskBadge = { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'MEDIUM' };
                }

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
                    <td style={{ padding: '14px 18px', color: 'var(--text-primary)' }}>
                      {claim.policy_holder_name || claim.features?.PolicyHolderName || 'Insured Client'}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {claim.features?.Make || 'Vehicle'} ({claim.features?.VehicleCategory || 'Sedan'})
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          background: riskBadge.bg, 
                          color: riskBadge.text, 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700 
                        }}>
                          {riskBadge.label} ({(score * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: claim.review_status === 'CLEARED' ? '#10b981' : (claim.review_status === 'ESCALATED' ? '#ef4444' : '#f59e0b') 
                      }}>
                        {claim.review_status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim); }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
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
                    </td>
                  </tr>
                );
              })}
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
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
