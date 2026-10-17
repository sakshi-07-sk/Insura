import React from 'react';

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = 'var(--primary)',
  bgColor = 'var(--primary-subtle)',
  onClick
}) {
  return (
    <div 
      className="card"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        padding: '20px'
      }}
    >
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {subtext && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {subtext}
          </div>
        )}
      </div>

      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: bgColor,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon size={22} />
      </div>
    </div>
  );
}
