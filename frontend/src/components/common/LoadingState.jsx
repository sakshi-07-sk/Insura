import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading risk analytics...', height = '240px' }) {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        gap: '12px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        padding: '24px'
      }}
      role="status"
      aria-live="polite"
    >
      <Loader2 
        size={32} 
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary)'
        }} 
      />
      <p style={{ fontSize: '13px', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
