import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { ClaimsTable } from '../claims/ClaimsTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

export function RecentClaimsTable({ 
  claims = [], 
  isLoading = false, 
  onSelectClaim 
}) {
  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <div>
          <div className="card-title">
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <span>Recent Claims Ingestion Stream</span>
          </div>
          <div className="card-subtitle">
            Latest claims scored by the real-time ML inference engine
          </div>
        </div>

        <Link to="/claims" className="btn btn-outline btn-sm">
          <span>View All in Queue</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Fetching recent claims from API..." height="180px" />
      ) : claims.length === 0 ? (
        <EmptyState 
          title="No claims registered" 
          message="No claims have been ingested into the system yet. Submit a new claim for scoring to populate the stream."
        />
      ) : (
        <ClaimsTable claims={claims} onSelectClaim={onSelectClaim} />
      )}
    </div>
  );
}
