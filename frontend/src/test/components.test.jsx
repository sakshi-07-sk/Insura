import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { RiskResultCard } from '../components/claims/RiskResultCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ClaimsTable } from '../components/claims/ClaimsTable';
import { ShieldCheck } from 'lucide-react';

describe('ClaimGuard UI Components Test Suite', () => {
  it('renders StatCard with title, value, subtext, and handles click', () => {
    const handleClick = vi.fn();
    render(
      <StatCard
        title="HIGH RISK CLAIMS"
        value={15}
        subtext="Priority Triage Required"
        icon={ShieldCheck}
        onClick={handleClick}
      />
    );

    expect(screen.getByText('HIGH RISK CLAIMS')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Priority Triage Required')).toBeInTheDocument();

    fireEvent.click(screen.getByText('HIGH RISK CLAIMS'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders RiskBadge with semantic text labels and does not rely on color alone', () => {
    const { rerender } = render(<RiskBadge category="LOW" />);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();

    rerender(<RiskBadge category="MEDIUM" />);
    expect(screen.getByText('Medium Risk')).toBeInTheDocument();

    rerender(<RiskBadge category="HIGH" />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders StatusBadge for review workflow states', () => {
    const { rerender } = render(<StatusBadge status="PENDING_REVIEW" />);
    expect(screen.getByText('Pending Review')).toBeInTheDocument();

    rerender(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText('Under Review')).toBeInTheDocument();

    rerender(<StatusBadge status="CLEARED" />);
    expect(screen.getByText('Cleared / Fast-Track')).toBeInTheDocument();

    rerender(<StatusBadge status="ESCALATED" />);
    expect(screen.getByText('Escalated to SIU')).toBeInTheDocument();
  });

  it('renders RiskResultCard with score, probability, model version, and mandatory legal disclaimer', () => {
    const mockResult = {
      claim_id: 'CLM-2026-9041',
      fraud_probability: 0.785,
      risk_score: 78.5,
      risk_category: 'HIGH',
      model_version: '1.0.0',
      requires_human_review: true,
      status: 'PENDING_REVIEW',
      message: 'Elevated model-estimated risk. Priority human investigation recommended.',
      disclaimer: 'NOTICE: AI-generated risk scores are decision-support indicators, not proof of fraud.',
      timestamp: '2026-10-17T09:15:00Z'
    };

    render(<RiskResultCard result={mockResult} onReset={() => {}} />);

    expect(screen.getByText('Claim ID: CLM-2026-9041')).toBeInTheDocument();
    expect(screen.getByText('78.5')).toBeInTheDocument();
    expect(screen.getByText(/78.5%/)).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Priority Human Investigation (SIU)')).toBeInTheDocument();
    expect(screen.getByText(/AI-generated risk scores are decision-support indicators/i)).toBeInTheDocument();
  });

  it('renders EmptyState with custom title, message, and action trigger', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No claims found"
        message="No records matched your search query."
        actionText="Clear Filters"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No claims found')).toBeInTheDocument();
    expect(screen.getByText('No records matched your search query.')).toBeInTheDocument();

    const button = screen.getByText('Clear Filters');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders ErrorState with retry capability and error message', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="API Network Failure"
        error={new Error('Connection refused by target machine')}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('API Network Failure')).toBeInTheDocument();
    expect(screen.getByText('Connection refused by target machine')).toBeInTheDocument();

    const retryBtn = screen.getByText('Retry Connection');
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders ClaimsTable with rows and triggers row inspection callback', () => {
    const mockClaims = [
      {
        claim_id: 'CLM-001',
        external_reference: 'POL-100',
        risk_score: 12.4,
        fraud_probability: 0.124,
        risk_category: 'LOW',
        review_status: 'CLEARED',
        created_at: '2026-10-17T08:00:00Z'
      },
      {
        claim_id: 'CLM-002',
        external_reference: 'POL-200',
        risk_score: 82.1,
        fraud_probability: 0.821,
        risk_category: 'HIGH',
        review_status: 'PENDING_REVIEW',
        created_at: '2026-10-17T09:00:00Z'
      }
    ];

    const handleSelect = vi.fn();
    render(<ClaimsTable claims={mockClaims} onSelectClaim={handleSelect} />);

    expect(screen.getByText('CLM-001')).toBeInTheDocument();
    expect(screen.getByText('CLM-002')).toBeInTheDocument();
    expect(screen.getByText('12.4')).toBeInTheDocument();
    expect(screen.getByText('82.1')).toBeInTheDocument();

    // Click inspect on second claim
    const inspectButtons = screen.getAllByText('Inspect');
    fireEvent.click(inspectButtons[1]);
    expect(handleSelect).toHaveBeenCalledWith(mockClaims[1]);
  });
});
