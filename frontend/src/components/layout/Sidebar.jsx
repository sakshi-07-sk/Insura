import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  ListFilter, 
  Activity, 
  FileText, 
  Cpu, 
  Settings,
  PlusCircle,
  FileStack,
  CheckCircle2,
  Bell,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  Briefcase,
  History,
  FileSpreadsheet,
  PieChart,
  Gauge,
  TrendingUp,
  SearchCheck,
  Scale,
  BarChart3,
  LogOut,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth, ROLE_DETAILS, ROLES, DEMO_ACCOUNTS } from '../../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Strictly role-specific navigation maps
  const NAV_CONFIG = {
    [ROLES.ADMIN]: [
      { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/admin/users', label: 'User Management', icon: Users },
      { path: '/admin/access', label: 'Role & Access Control', icon: ShieldCheck },
      { path: '/admin/claims', label: 'All Claims', icon: ListFilter },
      { path: '/admin/health', label: 'System Health', icon: Activity },
      { path: '/admin/audit', label: 'Audit Logs', icon: FileText },
      { path: '/admin/model-config', label: 'Model Configuration', icon: Cpu },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
    [ROLES.CLAIMS_OFFICER]: [
      { path: '/claims/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { path: '/claims/submit', label: 'Submit New Claim', icon: PlusCircle },
      { path: '/claims/my-claims', label: 'My Claims', icon: FileStack },
      { path: '/claims/status', label: 'Claim Status', icon: CheckCircle2 },
      { path: '/claims/notifications', label: 'Notifications', icon: Bell },
      { path: '/profile', label: 'Profile', icon: UserCheck },
    ],
    [ROLES.INVESTIGATOR]: [
      { path: '/investigator/dashboard', label: 'Investigation Dashboard', icon: LayoutDashboard },
      { path: '/investigator/queue', label: 'Investigation Queue', icon: AlertTriangle },
      { path: '/investigator/high-risk', label: 'High-Risk Claims', icon: ShieldAlert },
      { path: '/investigator/assigned', label: 'Assigned Cases', icon: Briefcase },
      { path: '/investigator/history', label: 'Review History', icon: History },
      { path: '/investigator/reports', label: 'Investigation Reports', icon: FileSpreadsheet },
      { path: '/profile', label: 'Profile', icon: UserCheck },
    ],
    [ROLES.ANALYST]: [
      { path: '/analyst/dashboard', label: 'Risk Overview', icon: LayoutDashboard },
      { path: '/analyst/distribution', label: 'Risk Distribution', icon: PieChart },
      { path: '/analyst/performance', label: 'Model Performance', icon: Gauge },
      { path: '/analyst/trends', label: 'Fraud Trends', icon: TrendingUp },
      { path: '/analyst/false-positives', label: 'False Positive Analysis', icon: SearchCheck },
      { path: '/analyst/fairness', label: 'Fairness & Bias', icon: Scale },
      { path: '/analyst/reports', label: 'Model Reports', icon: BarChart3 },
      { path: '/profile', label: 'Profile', icon: UserCheck },
    ],
  };

  const currentRole = role || ROLES.CLAIMS_OFFICER;
  const currentRoleDetails = ROLE_DETAILS[currentRole] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];
  const roleNavItems = NAV_CONFIG[currentRole] || NAV_CONFIG[ROLES.CLAIMS_OFFICER];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 998,
            backdropFilter: 'blur(4px)'
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#070d19',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)'
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.35)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                INSURA <span style={{ fontSize: '9px', color: '#06b6d4', padding: '1px 6px', background: 'rgba(6,182,212,0.15)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.3)', fontWeight: 700 }}>s390x</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RISK INTELLIGENCE
              </div>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '4px',
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div style={{
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Current Workspace
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: currentRoleDetails.color, marginTop: '2px' }}>
              {currentRoleDetails.name}
            </div>
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '10px',
            background: currentRoleDetails.bg,
            color: currentRoleDetails.color,
            border: `1px solid ${currentRoleDetails.color}35`
          }}>
            {currentRoleDetails.badge}
          </span>
        </div>

        {/* Dynamic Navigation Section for Active Role */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#475569', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            padding: '0 12px 6px'
          }}>
            Navigation
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {roleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.16)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s'
                  })}
                  className="nav-link-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.4 }} />
                </NavLink>
              );
            })}
          </nav>

          {/* Quick link to Landing Page */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} />
              <span>Public Landing Page</span>
            </Link>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#050912',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <Link 
            to="/profile" 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, textDecoration: 'none' }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: currentRoleDetails.bg,
              color: currentRoleDetails.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              flexShrink: 0,
              border: `1px solid ${currentRoleDetails.color}50`
            }}>
              {user?.initials || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Authorized User'}
              </div>
              <div style={{ fontSize: '11px', color: currentRoleDetails.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentRoleDetails.name}
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
        @media (min-width: 1024px) {
          .sidebar {
            transform: none !important;
          }
        }
        .nav-link-item:hover:not([class*="active"]) {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }
      `}</style>
    </>
  );
}
