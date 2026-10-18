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
  ChevronDown,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api, getApiBaseUrl, isMockModeEnabled, getReviewerId, setReviewerId } from '../../services/api';
import { useAuth, DEMO_ACCOUNTS, ROLES, ROLE_DETAILS } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Operational Overview',
  '/admin/dashboard': 'Admin Governance & Overview',
  '/admin/users': 'User Management & Provisioning',
  '/admin/access': 'Role & Access Control (RBAC)',
  '/admin/claims': 'All Claims Governance Queue',
  '/admin/health': 'System Health & Infrastructure Telemetry',
  '/admin/audit': 'Platform Security & Audit Trails',
  '/admin/model-config': 'Model Configuration & Thresholds',
  '/claims/dashboard': 'Claims Intake & Triage Workspace',
  '/claims/submit': 'Submit New Insurance Claim',
  '/claims/my-claims': 'My Filed Claims Queue',
  '/claims/status': 'Claim Status & Processing Tracker',
  '/claims/notifications': 'Claims Activity & Decision Alerts',
  '/investigator/dashboard': 'SIU Fraud Investigation Command Center',
  '/investigator/queue': 'Fraud Investigation Queue',
  '/investigator/high-risk': 'High-Risk Priority Claims',
  '/investigator/assigned': 'My Assigned Investigation Cases',
  '/investigator/history': 'SIU Review History & Closed Audits',
  '/investigator/reports': 'Fraud Investigation Reports & Analytics',
  '/analyst/dashboard': 'Risk Intelligence & Model Overview',
  '/analyst/distribution': 'Claim Risk Score Distribution',
  '/analyst/performance': 'Model Performance & Evaluation Metrics',
  '/analyst/trends': 'Fraud Trends & Anomaly Insights',
  '/analyst/false-positives': 'False Positive & Fast-Track Analysis',
  '/analyst/fairness': 'Fairness, Bias & Demographic Parity',
  '/analyst/reports': 'Model Governance & Validation Reports',
  '/profile': 'User Profile & Security Settings',
  '/settings': 'System Settings & Integration',
  '/claims': 'Claims Triage Queue',
  '/score': 'Real-Time Risk Scorer',
  '/reviews': 'Human Review Center',
  '/insights': 'Model Governance Insights',
};

export function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Risk Intelligence Platform';

  const { user, role, switchRole } = useAuth();
  const currentRoleDetails = ROLE_DETAILS[role] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];

  const [connStatus, setConnStatus] = useState('checking'); // 'connected', 'unavailable', 'checking'
  const [connDetails, setConnDetails] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    const targetRoute = ROLE_DETAILS[newRole]?.defaultRoute || '/claims/dashboard';
    navigate(targetRoute);
  };

  return (
    <>
      <header
        style={{
          height: 'var(--topbar-height)',
          backgroundColor: '#0a1122',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
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
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
                {pageTitle}
              </h1>
              <span className="role-tag-pill" style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                background: currentRoleDetails.bg,
                color: currentRoleDetails.color,
                whiteSpace: 'nowrap'
              }}>
                {currentRoleDetails.name}
              </span>
            </div>
            <div className="topbar-subtitle" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-Time Insurance Claim Risk Scoring • LinuxONE s390x
            </div>
          </div>
        </div>

        {/* Center: Search control */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="search-container"
          style={{
            flex: '0 1 320px',
            position: 'relative'
          }}
        >
          <Search 
            size={15} 
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
            placeholder="Search Claim ID (e.g. CLM-1001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{
              paddingLeft: '34px',
              paddingRight: '12px',
              height: '34px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px'
            }}
          />
        </form>

        {/* Right: Role Switcher & API Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Connection Status Indicator */}
          <button
            onClick={() => setShowStatusModal(true)}
            className="topbar-status-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 
                connStatus === 'connected' ? 'var(--risk-low-bg)' :
                connStatus === 'unavailable' ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
              color: 
                connStatus === 'connected' ? 'var(--risk-low-text)' :
                connStatus === 'unavailable' ? 'var(--risk-high-text)' : 'var(--risk-med-text)',
              border: `1px solid ${
                connStatus === 'connected' ? 'var(--risk-low-border)' :
                connStatus === 'unavailable' ? 'var(--risk-high-border)' : 'var(--risk-med-border)'
              }`,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Click to view API service diagnostics"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor:
                  connStatus === 'connected' ? 'var(--status-online)' :
                  connStatus === 'unavailable' ? 'var(--status-offline)' : 'var(--status-checking)',
                animation: connStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
              }}
            />
            <span className="status-text" style={{ textTransform: 'capitalize' }}>
              {connStatus === 'connected' ? 'API Live' : connStatus === 'unavailable' ? 'API Offline' : 'Connecting...'}
            </span>
          </button>

          {/* Interactive Role Switcher */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '10px',
              borderLeft: '1px solid var(--border-light)'
            }}
            className="reviewer-profile-box"
          >
            <div 
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentRoleDetails.bg,
                color: currentRoleDetails.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0
              }}
            >
              {user?.initials || 'U'}
            </div>
            <div>
              <div className="role-switcher-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Role:
                </span>
              </div>
              <select
                value={role || ROLES.CLAIMS_OFFICER}
                onChange={handleRoleChange}
                className="role-switcher-select"
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: currentRoleDetails.color,
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                  maxWidth: '140px'
                }}
                title="Switch active role workspace"
              >
                <option value={ROLES.ADMIN} style={{ backgroundColor: '#0a1122', color: '#ffffff' }}>Admin</option>
                <option value={ROLES.CLAIMS_OFFICER} style={{ backgroundColor: '#0a1122', color: '#ffffff' }}>Claims Officer</option>
                <option value={ROLES.INVESTIGATOR} style={{ backgroundColor: '#0a1122', color: '#ffffff' }}>Investigator</option>
                <option value={ROLES.ANALYST} style={{ backgroundColor: '#0a1122', color: '#ffffff' }}>Risk Analyst</option>
              </select>
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
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
              boxShadow: 'var(--shadow-lg)',
              borderRadius: '12px',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                <Activity size={18} color="var(--primary)" />
                <span>Backend Service Status</span>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ 
                  fontWeight: 700, 
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

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '4px 0' }}>
                Backend running on <strong>IBM LinuxONE s390x</strong>. All risk scoring predictions run natively using the verified Random Forest model pipeline.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-app)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setShowStatusModal(false);
                    navigate('/settings');
                  }}
                >
                  Configure API URL
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={isPinging}
                  onClick={checkConnectivity}
                >
                  {isPinging ? 'Checking...' : 'Recheck Health'}
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
            display: flex !important;
          }
          .search-container {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          header {
            padding: 0 12px !important;
          }
          .topbar-subtitle {
            display: none !important;
          }
          .role-tag-pill {
            display: none !important;
          }
          .role-switcher-label {
            display: none !important;
          }
          .status-text {
            display: none !important;
          }
          .topbar-status-btn {
            padding: 6px !important;
          }
        }
      `}</style>
    </>
  );
}
