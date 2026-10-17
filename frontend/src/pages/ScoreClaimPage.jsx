import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ClaimForm } from '../components/claims/ClaimForm';
import { RiskResultCard } from '../components/claims/RiskResultCard';
import { ErrorState } from '../components/common/ErrorState';

export function ScoreClaimPage() {
  const navigate = useNavigate();
  const [scoringResult, setScoringResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const handleScoredSuccess = (result) => {
    setScoringResult(result);
    setSubmissionError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setScoringResult(null);
    setSubmissionError(null);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Real-Time Claim Risk Scoring
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Input verified policy and accident parameters to receive real-time fraud probability scores from the machine learning inference model
        </div>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <ErrorState
          title="Claim Scoring Request Failed"
          error={submissionError}
          onRetry={() => setSubmissionError(null)}
        />
      )}

      {/* Results Card if Scored */}
      {scoringResult ? (
        <RiskResultCard
          result={scoringResult}
          onReset={handleResetForm}
          onViewInQueue={() => navigate('/claims')}
          onOpenReview={(id) => navigate(`/reviews?claim_id=${encodeURIComponent(id)}`)}
        />
      ) : (
        /* Form */
        <ClaimForm
          onScored={handleScoredSuccess}
          onError={(err) => setSubmissionError(err)}
        />
      )}
    </div>
  );
}
