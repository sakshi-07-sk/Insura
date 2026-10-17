import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileStack, 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  Flag, 
  TrendingUp, 
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { RecentClaimsTable } from '../components/dashboard/RecentClaimsTable';
import { ClaimDetailsDrawer } from '../components/claims/ClaimDetailsDrawer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { api } from '../services/api';

export function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, claimsData] = await Promise.all([
        api.getDashboardStats(),
        api.getClaims({ page: 1, page_size: 5 })
      ]);
      setStats(statsData);
      setRecentClaims(claimsData.claims || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const handleClaimStatusUpdated = (updatedClaim) => {
    // Update claim in recent claims list
    setRecentClaims((prev) =>
      prev.map((c) => (c.claim_id === updatedClaim.claim_id ? updatedClaim : c))
    );
    setSelectedClaim(updatedClaim);
    // Refresh stats in background
    api.getDashboardStats().then(setStats).catch(() => {});
  };

  if (isLoading && !stats) {
    return <LoadingState message="Connecting to IBM Z Risk Engine and loading live statistics..." height="400px" />;
  }

  if (error && !stats) {
    return (
      <ErrorState 
        title="Unable to load operational dashboard statistics" 
        error={error} 
        onRetry={loadDashboardData} 
      />
    );
  }

  const highRiskCount = stats?.risk_category_counts?.HIGH || 0;
  const pendingCount = stats?.claims_awaiting_review || stats?.review_status_counts?.PENDING_REVIEW || 0;
  const clearedCount = stats?.cleared_claims || stats?.review_status_counts?.CLEARED || 0;
  const escalatedCount = stats?.escalated_claims || stats?.review_status_counts?.ESCALATED || 0;
  const avgScore = stats?.average_risk_score !== undefined ? Number(stats.average_risk_score).toFixed(1) : '—';

  return (
    <div className="animate-fade-in">
      {/* Page Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Insurance Claims Triage & Risk Operations
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time machine-learning triage prioritizing investigations and fast-tracking genuine claims
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/score')}
          >
            <PlusCircle size={14} />
            <span>Score New Claim</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <StatCard
          title="TOTAL CLAIMS INGESTED"
          value={stats?.total_claims || 0}
          subtext="Persistent SQLite/PostgreSQL store"
          icon={FileStack}
          accentColor="var(--primary)"
          bgColor="var(--primary-subtle)"
          onClick={() => navigate('/claims')}
        />

        <StatCard
          title="HIGH RISK CLAIMS"
          value={highRiskCount}
          subtext="Exceeds 61.0 fraud threshold"
          icon={AlertOctagon}
          accentColor="var(--risk-high-accent)"
          bgColor="var(--risk-high-bg)"
          onClick={() => navigate('/claims?risk_category=HIGH')}
        />

        <StatCard
          title="AWAITING REVIEW"
          value={pendingCount}
          subtext="Pending human adjuster triage"
          icon={Clock}
          accentColor="var(--status-pending-accent)"
          bgColor="var(--status-pending-bg)"
          onClick={() => navigate('/reviews')}
        />

        <StatCard
          title="FAST-TRACK CLEARED"
          value={clearedCount}
          subtext="Approved for accelerated settlement"
          icon={CheckCircle}
          accentColor="var(--status-cleared-accent)"
          bgColor="var(--status-cleared-bg)"
          onClick={() => navigate('/claims?review_status=CLEARED')}
        />

        <StatCard
          title="ESCALATED TO SIU"
          value={escalatedCount}
          subtext="Referred for fraud investigation"
          icon={Flag}
          accentColor="var(--status-escalated-accent)"
          bgColor="var(--status-escalated-bg)"
          onClick={() => navigate('/claims?review_status=ESCALATED')}
        />

        <StatCard
          title="AVG RISK SCORE"
          value={`${avgScore}/100`}
          subtext="Mean calibrated probability"
          icon={TrendingUp}
          accentColor="#0284c7"
          bgColor="#f0f9ff"
        />
      </div>

      {/* Visual Analytics Charts */}
      <RiskDistributionChart 
        riskCategoryCounts={stats?.risk_category_counts}
        reviewStatusCounts={stats?.review_status_counts}
      />

      {/* Recent Claims Stream Table */}
      <RecentClaimsTable 
        claims={recentClaims}
        isLoading={isLoading}
        onSelectClaim={(claim) => setSelectedClaim(claim)}
      />

      {/* Claim Details Drawer Modal */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onStatusUpdated={handleClaimStatusUpdated}
        />
      )}
    </div>
  );
}
