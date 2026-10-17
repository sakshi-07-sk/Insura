import React, { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, ServerCrash } from 'lucide-react';

export function ErrorState({ 
  title = 'Failed to load data', 
  error, 
  onRetry, 
  compact = false 
}) {
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred while communicating with the service.');

  return (
    <div 
      className="card"
      style={{
        border: '1px solid var(--risk-high-border)',
        backgroundColor: '#fffcfc',
        padding: compact ? '16px' : '28px',
        textAlign: 'center',
        margin: '16px 0'
      }}
      role="alert"
    >
      <div style={{
        display: 'inline-flex',
        padding: '12px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--risk-high-bg)',
        color: 'var(--risk-high-accent)',
        marginBottom: '12px'
      }}>
        <ServerCrash size={28} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--risk-high-text)', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 16px' }}>
        {errorMessage}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
        {onRetry && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={onRetry}
            aria-label="Retry loading data"
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        )}

        {error?.stack && (
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>{showDetails ? 'Hide Diagnostics' : 'View Diagnostics'}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {showDetails && error?.stack && (
        <pre style={{
          marginTop: '16px',
          textAlign: 'left',
          fontSize: '11px',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          overflowX: 'auto',
          maxHeight: '160px'
        }}>
          {error.stack}
        </pre>
      )}
    </div>
  );
}
