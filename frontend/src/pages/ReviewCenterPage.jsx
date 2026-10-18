import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  CheckCircle, 
  Flag, 
  RefreshCw, 
  Info, 
  Eye
} from 'lucide-react';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { ClaimDetailsDrawer } from '../components/claims/ClaimDetailsDrawer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { api, getReviewerId } from '../services/api';

const TABS = [
  { id: 'PENDING_REVIEW', label: 'Pending Adjuster Triage', icon: Clock, countKey: 'PENDING_REVIEW' },
  { id: 'UNDER_REVIEW', label: 'Under Active Audit', icon: Search, countKey: 'UNDER_REVIEW' },
  { id: 'ESCALATED', label: 'Escalated to SIU', icon: Flag, countKey: 'ESCALATED' },
  { id: 'CLEARED', label: 'Cleared for Payout', icon: CheckCircle, countKey: 'CLEARED' }
];

export function ReviewCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'PENDING_REVIEW';
  const claimIdParam = searchParams.get('claim_id');

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const reviewerId = getReviewerId();

  const loadReviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        api.getClaims({ review_status: activeTab, page_size: 50 }),
        api.getDashboardStats()
      ]);

      // Sort by risk_score descending so highest risk claims require immediate attention
      const sorted = (claimsRes.claims || []).sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
      setClaims(sorted);
      setStats(statsRes);

      // If URL specified a claim_id, open it immediately
      if (claimIdParam) {
        const target = sorted.find(c => c.claim_id === claimIdParam);
        if (target) {
          setSelectedClaim(target);
        } else {
          // Attempt to fetch individually
          api.getClaimById(claimIdParam).then(setSelectedClaim).catch(() => {});
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewData();
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ status: tabId });
  };

  const handleStatusUpdated = (updatedClaim) => {
    setSelectedClaim(updatedClaim);
    // If status changed away from current tab, filter it out or update
    setClaims((prev) =>
      prev.map((c) => (c.claim_id === updatedClaim.claim_id ? updatedClaim : c))
    );
    // Refresh stats
    api.getDashboardStats().then(setStats).catch(() => {});
  };

  return (
    <div className="animate-fade-in">
      {/* Page Title & Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Adjuster Review Center
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Special Investigation Unit (SIU) and Claim Adjuster decision-support workflow
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Active Reviewer: <strong>{reviewerId}</strong>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={loadReviewData}
            disabled={isLoading}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Workflow</span>
          </button>
        </div>
      </div>

      {/* Human-in-the-Loop Safeguard Notice */}
      <div className="notice-disclaimer" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Info size={16} />
          <span>Ethical & Operational Workflow Guarantee</span>
        </div>
        <p style={{ marginTop: '4px' }}>
          Under our enterprise AI architecture, AI scores prioritize human investigator review rather than generating automated rejections. Claims marked <strong>HIGH RISK</strong> are routed to this queue for manual audit before any payout denial or escalation occurs.
        </p>
      </div>

      {/* Workflow Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '2px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = stats?.review_status_counts?.[tab.countKey] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-light) var(--border-light) transparent' : 'transparent',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span 
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Stream */}
      {isLoading ? (
        <LoadingState message={`Fetching ${activeTab} claims stream...`} height="280px" />
      ) : error ? (
        <ErrorState 
          title="Failed to load review workflow records" 
          error={error} 
          onRetry={loadReviewData} 
        />
      ) : claims.length === 0 ? (
        <EmptyState
          title={`No claims under ${activeTab.replace('_', ' ')}`}
          message="No insurance claims currently require action in this specific review state."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {claims.map((claim) => {
            const score = typeof claim.risk_score === 'number' ? claim.risk_score.toFixed(1) : '—';
            const prob = typeof claim.fraud_probability === 'number' ? (claim.fraud_probability * 100).toFixed(1) : '—';
            const isHigh = claim.risk_category === 'HIGH';

            return (
              <div
                key={claim.claim_id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderLeft: isHigh ? '4px solid var(--risk-high-accent)' : undefined
                }}
              >
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>
                      {claim.claim_id}
                    </span>
                    <RiskBadge category={claim.risk_category} size="sm" />
                    <StatusBadge status={claim.review_status} size="sm" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Ref: {claim.external_reference || 'N/A'} • Ingested: {claim.created_at ? new Date(claim.created_at).toLocaleString() : 'Recent'}
                  </div>
                  {claim.review_notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
                      Note: "{claim.review_notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Risk Score / Prob
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: isHigh ? 'var(--risk-high-text)' : 'var(--text-primary)' }}>
                      {score} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>({prob}%)</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <Eye size={14} />
                    <span>Open Case & Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Review Drawer */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
