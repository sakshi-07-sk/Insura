import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  User, 
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { api, getApiBaseUrl, isMockModeEnabled, getReviewerId, setReviewerId } from '../../services/api';

const PAGE_TITLES = {
  '/': 'Operational Overview',
  '/claims': 'Claims Triage Queue',
  '/score': 'Score a Claim',
  '/reviews': 'Adjuster Review Center',
  '/insights': 'Model Performance Insights',
  '/settings': 'System Settings & Integration'
};

export function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  const [connStatus, setConnStatus] = useState('checking'); // 'connected', 'unavailable', 'checking'
  const [connDetails, setConnDetails] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReviewer, setActiveReviewer] = useState(getReviewerId());
  const [isPinging, setIsPinging] = useState(false);

  const checkConnectivity = async () => {
    setIsPinging(true);
    setConnStatus('checking');
    try {
      const start = Date.now();
      const health = await api.checkHealth();
      const latency = Date.now() - start;
      setConnStatus('connected');
      setConnDetails({
        status: health.status,
        service: health.service,
        version: health.version,
        latency: `${latency}ms`,
        url: getApiBaseUrl()
      });
    } catch (err) {
      setConnStatus('unavailable');
      setConnDetails({
        error: err.message,
        url: getApiBaseUrl()
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // 30s background check
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanQuery = searchQuery.trim().toUpperCase();
    navigate(`/claims?search=${encodeURIComponent(cleanQuery)}`);
  };

  const handleReviewerChange = (newReviewer) => {
    setActiveReviewer(newReviewer);
    setReviewerId(newReviewer);
  };

  return (
    <>
      <header
        style={{
          height: 'var(--topbar-height)',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Left: Mobile Toggle & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onOpenSidebar}
            className="mobile-hamburger"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              display: 'none'
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {pageTitle}
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-Time Insurance Claim Risk Scoring & Fraud Triage
            </div>
          </div>
        </div>

        {/* Center: Search control */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="search-container"
          style={{
            flex: '0 1 360px',
            position: 'relative'
          }}
        >
          <Search 
            size={16} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="search"
            placeholder="Search by Claim ID (e.g. CLM-2026-00101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{
              paddingLeft: '36px',
              paddingRight: '12px',
              height: '36px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-app)'
            }}
          />
        </form>

        {/* Right: API Status & Reviewer Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mock mode pill if active */}
          {isMockModeEnabled() && (
            <span 
              className="badge" 
              style={{ 
                backgroundColor: '#fef3c7', 
                color: '#92400e', 
                border: '1px solid #fde68a',
                fontSize: '11px'
              }}
              title="Development Mock Mode is currently active in settings"
            >
              Demo Data Active
            </span>
          )}

          {/* Connection Status Indicator */}
          <button
            onClick={() => setShowStatusModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 
                connStatus === 'connected' ? 'var(--risk-low-bg)' :
                connStatus === 'unavailable' ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
              color: 
                connStatus === 'connected' ? 'var(--risk-low-text)' :
                connStatus === 'unavailable' ? 'var(--risk-high-text)' : 'var(--risk-med-text)',
              border: `1px solid ${
                connStatus === 'connected' ? 'var(--risk-low-border)' :
                connStatus === 'unavailable' ? 'var(--risk-high-border)' : 'var(--risk-med-border)'
              }`
            }}
            title="Click to view API service diagnostics"
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor:
                  connStatus === 'connected' ? 'var(--status-online)' :
                  connStatus === 'unavailable' ? 'var(--status-offline)' : 'var(--status-checking)',
                animation: connStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
              }}
            />
            <span style={{ textTransform: 'capitalize' }}>
              {connStatus === 'connected' ? 'API Connected' : connStatus === 'unavailable' ? 'API Offline' : 'Checking API...'}
            </span>
          </button>

          {/* Reviewer Profile */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '12px',
              borderLeft: '1px solid var(--border-light)'
            }}
            className="reviewer-profile-box"
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={16} />
            </div>
            <div>
              <select
                value={activeReviewer}
                onChange={(e) => handleReviewerChange(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  paddingRight: '4px'
                }}
                title="Select active reviewer identity for audit trail"
              >
                <option value="adjuster_marcus">Marcus (Adjuster)</option>
                <option value="adjuster_elena">Elena (Senior Adjuster)</option>
                <option value="siu_lead_davis">Davis (SIU Lead)</option>
              </select>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Audit ID: {activeReviewer}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* API Connectivity Diagnostics Modal */}
      {showStatusModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="card-title">
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                <span>Backend Service Status</span>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '12px',
                  color: connStatus === 'connected' ? 'var(--risk-low-text)' : 'var(--risk-high-text)' 
                }}>
                  {connStatus.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configured API Base URL:</span>
                <span style={{ fontWeight: 600, fontSize: '12px', fontFamily: 'monospace' }}>
                  {getApiBaseUrl()}
                </span>
              </div>

              {connDetails?.latency && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Roundtrip Latency:</span>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--primary)' }}>
                    {connDetails.latency}
                  </span>
                </div>
              )}

              {connDetails?.error && (
                <div style={{ padding: '12px', backgroundColor: 'var(--risk-high-bg)', color: 'var(--risk-high-text)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                  <strong>Connection Error:</strong> {connDetails.error}
                </div>
              )}

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                The frontend verifies backend health via <code>GET /health</code>. To change the target API host (e.g. for LinuxONE ingress or reverse proxies), navigate to the Settings page.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowStatusModal(false);
                    navigate('/settings');
                  }}
                >
                  <SlidersHorizontal size={14} />
                  <span>Configure API URL</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={isPinging}
                  onClick={checkConnectivity}
                >
                  <RefreshCw size={14} style={{ animation: isPinging ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Recheck Health</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        @media (max-width: 1023px) {
          .mobile-hamburger {
            display: block !important;
          }
          .search-container {
            display: none !important;
          }
          .reviewer-profile-box {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
