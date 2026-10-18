import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { ClaimForm } from '../../components/claims/ClaimForm';
import { RiskResultCard } from '../../components/claims/RiskResultCard';

export function SubmitClaim() {
  const [scoringResult, setScoringResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleScored = (result) => {
    setScoringResult(result);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleError = (error) => {
    setErrorMessage(error?.message || 'Failed to score claim with backend inference engine');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Submit Claim & Real-Time AI Scoring
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
              Direct Inference
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Enter policyholder information, accident parameters, and vehicle telemetry for instant LinuxONE risk evaluation.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '14px 18px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real-time Scoring Result Banner */}
      {scoringResult && (
        <div style={{ marginBottom: '8px' }}>
          <RiskResultCard 
            result={scoringResult} 
            onReset={() => setScoringResult(null)} 
          />
        </div>
      )}

      {/* Claim Submission Form */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <ClaimForm onScored={handleScored} onError={handleError} />
      </div>
    </div>
  );
}
