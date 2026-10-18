import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Persistent / Responsive Role-Specific Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          transition: 'margin-left var(--transition-normal)'
        }}
        className="main-layout-wrapper"
      >
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main 
          className="main-content-area"
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          <Outlet />
        </main>

        {/* Global Footer & Ethical Governance Disclaimer */}
        <footer 
          style={{
            padding: '16px 24px',
            backgroundColor: '#070d19',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ color: '#94a3b8' }}>INSURA Platform</strong>
            <span>•</span>
            <span>Real-Time Insurance Claim Scoring & Fraud Triage Engine</span>
            <span>•</span>
            <span style={{ color: '#06b6d4' }}>IBM LinuxONE (s390x)</span>
          </div>
          <div>
            AI-generated risk scores are decision-support indicators. Final determinations require authorized human review.
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .main-layout-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
