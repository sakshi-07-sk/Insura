import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { ClaimsTable } from '../components/claims/ClaimsTable';
import { ClaimDetailsDrawer } from '../components/claims/ClaimDetailsDrawer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';

export function ClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state initialized from URL search params
  const [riskCategory, setRiskCategory] = useState(searchParams.get('risk_category') || 'ALL');
  const [reviewStatus, setReviewStatus] = useState(searchParams.get('review_status') || 'ALL');
  const [searchId, setSearchId] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const pageSize = 20;

  // Data state
  const [claimsData, setClaimsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const fetchClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getClaims({
        risk_category: riskCategory !== 'ALL' ? riskCategory : undefined,
        review_status: reviewStatus !== 'ALL' ? reviewStatus : undefined,
        page,
        page_size: pageSize
      });
      setClaimsData(response);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [riskCategory, reviewStatus, page, pageSize]);

  // Handle URL param synchronization
  useEffect(() => {
    const params = new URLSearchParams();
    if (riskCategory !== 'ALL') params.set('risk_category', riskCategory);
    if (reviewStatus !== 'ALL') params.set('review_status', reviewStatus);
    if (searchId) params.set('search', searchId);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [riskCategory, reviewStatus, searchId, page]);

  // Client-side search filtering by ID or external ref
  const filteredClaims = (claimsData?.claims || []).filter((claim) => {
    if (!searchId.trim()) return true;
    const query = searchId.trim().toUpperCase();
    const idMatch = claim.claim_id?.toUpperCase().includes(query);
    const refMatch = claim.external_reference?.toUpperCase().includes(query);
    return idMatch || refMatch;
  });

  const handleClaimUpdated = (updated) => {
    setSelectedClaim(updated);
    setClaimsData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        claims: prev.claims.map((c) => (c.claim_id === updated.claim_id ? updated : c))
      };
    });
  };

  const handleClearFilters = () => {
    setRiskCategory('ALL');
    setReviewStatus('ALL');
    setSearchId('');
    setPage(1);
  };

  const totalPages = claimsData?.total_pages || 1;
  const totalCount = claimsData?.total || 0;

  return (
    <div className="animate-fade-in">
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Claims Triage Queue
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Filter, search, and audit claims scored by the machine learning inference model
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={fetchClaims}
          disabled={isLoading}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div 
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Search by ID input */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 240px' }}>
            <Search 
              size={15} 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search Claim ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '13px' }}
            />
            {searchId && (
              <button
                onClick={() => setSearchId('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '2px' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Risk Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Risk Tier:
            </label>
            <select
              className="form-control"
              value={riskCategory}
              onChange={(e) => {
                setRiskCategory(e.target.value);
                setPage(1);
              }}
              style={{ height: '36px', minWidth: '130px', fontSize: '12px' }}
            >
              <option value="ALL">All Tiers</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Review Status:
            </label>
            <select
              className="form-control"
              value={reviewStatus}
              onChange={(e) => {
                setReviewStatus(e.target.value);
                setPage(1);
              }}
              style={{ height: '36px', minWidth: '150px', fontSize: '12px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CLEARED">Cleared / Fast-Track</option>
              <option value="ESCALATED">Escalated to SIU</option>
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        {(riskCategory !== 'ALL' || reviewStatus !== 'ALL' || searchId) && (
          <button 
            className="btn btn-outline btn-sm"
            onClick={handleClearFilters}
          >
            <X size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Table / State Container */}
      {isLoading ? (
        <LoadingState message="Fetching filtered claims from backend..." height="320px" />
      ) : error ? (
        <ErrorState 
          title="Failed to fetch claims list" 
          error={error} 
          onRetry={fetchClaims} 
        />
      ) : filteredClaims.length === 0 ? (
        <EmptyState
          title="No claims match your filter criteria"
          message="Try resetting your risk tier or review status filters, or search for a different claim identifier."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <ClaimsTable 
            claims={filteredClaims} 
            onSelectClaim={(claim) => setSelectedClaim(claim)} 
          />

          {/* Pagination Footer */}
          <div 
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              Showing <strong>{filteredClaims.length}</strong> of <strong>{totalCount}</strong> recorded claims (Page {page} of {totalPages})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Details Drawer Modal */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onStatusUpdated={handleClaimUpdated}
        />
      )}
    </div>
  );
}
