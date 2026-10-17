import React from 'react';
import { Inbox, PlusCircle } from 'lucide-react';

export function EmptyState({
  title = 'No records found',
  message = 'There are currently no claims matching your filter criteria.',
  icon: Icon = Inbox,
  actionText,
  onAction
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-light)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h4>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: actionText ? '20px' : '0' }}>
        {message}
      </p>

      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <PlusCircle size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
