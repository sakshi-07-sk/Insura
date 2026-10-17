import React from 'react';
import { Eye, ShieldAlert, ArrowRight, Calendar, User } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../common/Badge';

export function ClaimsTable({ 
  claims = [], 
  onSelectClaim, 
  compact = false 
}) {
  if (!claims || claims.length === 0) {
    return null;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Submitted Date</th>
            <th>Risk Score</th>
            <th>Triage Tier</th>
            <th>Review Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => {
            const score = typeof claim.risk_score === 'number' ? claim.risk_score : 0;
            const prob = typeof claim.fraud_probability === 'number' ? (claim.fraud_probability * 100).toFixed(1) : null;
            const formattedDate = claim.created_at 
              ? new Date(claim.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent';

            // Risk bar color
            const barColor = 
              claim.risk_category === 'HIGH' ? 'var(--risk-high-accent)' :
              claim.risk_category === 'MEDIUM' ? 'var(--risk-med-accent)' : 'var(--risk-low-accent)';

            return (
              <tr 
                key={claim.claim_id}
                onClick={() => onSelectClaim && onSelectClaim(claim)}
                style={{ cursor: 'pointer' }}
              >
                {/* Claim ID & Ref */}
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {claim.claim_id}
                  </div>
                  {claim.external_reference && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Ref: {claim.external_reference}
                    </div>
                  )}
                </td>

                {/* Date */}
                <td>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formattedDate}
                  </div>
                  {claim.created_at && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </td>

                {/* Risk Score */}
                <td style={{ minWidth: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', width: '36px' }}>
                      {score.toFixed(1)}
                    </span>
                    <div 
                      style={{ 
                        flex: 1, 
                        height: '6px', 
                        backgroundColor: 'var(--bg-subtle)', 
                        borderRadius: '3px',
                        overflow: 'hidden' 
                      }}
                    >
                      <div 
                        style={{ 
                          width: `${Math.min(100, Math.max(0, score))}%`, 
                          height: '100%', 
                          backgroundColor: barColor,
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>
                  {prob && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Fraud Prob: {prob}%
                    </div>
                  )}
                </td>

                {/* Risk Category */}
                <td>
                  <RiskBadge category={claim.risk_category} />
                </td>

                {/* Review Status */}
                <td>
                  <StatusBadge status={claim.review_status} />
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectClaim) onSelectClaim(claim);
                    }}
                    title="View complete risk analysis and details"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
