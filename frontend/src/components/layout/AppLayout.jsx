import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { isMockModeEnabled, setMockModeEnabled } from '../../services/api';
import { AlertTriangle } from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mockActive, setMockActive] = useState(isMockModeEnabled());

  const handleDisableMock = () => {
    setMockModeEnabled(false);
    setMockActive(false);
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left var(--transition-normal)'
        }}
        className="main-layout-wrapper"
      >
        {/* Mock Mode Explicit Warning Banner */}
        {mockActive && (
          <div className="demo-banner" role="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>
                <strong>DEMO DATA MODE ACTIVE:</strong> The application is currently displaying isolated synthetic test data. Real model predictions require connecting to Member 2's backend.
              </span>
            </div>
            <button 
              onClick={handleDisableMock}
              style={{
                background: '#ffffff',
                border: '1px solid #fde68a',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#92400e',
                cursor: 'pointer'
              }}
            >
              Switch to Live API
            </button>
          </div>
        )}

        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main 
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
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <strong>INSURA Risk Intelligence</strong> — Real-Time Insurance Claim Scoring & Fraud Triage Engine
          </div>
          <div>
            AI-generated risk scores are decision-support indicators, not proof of fraud. Final claim decisions require appropriate human review.
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
