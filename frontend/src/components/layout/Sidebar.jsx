import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListFilter, 
  FileCheck2, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  X,
  Server,
  Users,
  ShieldCheck,
  FileStack,
  Flag,
  BarChart3,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth, ROLE_DETAILS, ROLES } from '../../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ROLE_NAV = [
    { path: '/admin/dashboard', label: 'Admin Governance', icon: Users, role: ROLES.ADMIN },
    { path: '/claims/dashboard', label: 'Claims Intake', icon: FileStack, role: ROLES.CLAIMS_OFFICER },
    { path: '/investigator/dashboard', label: 'SIU Investigation', icon: Flag, role: ROLES.INVESTIGATOR },
    { path: '/analyst/dashboard', label: 'Model Analytics', icon: BarChart3, role: ROLES.ANALYST },
  ];

  const CORE_NAV = [
    { path: '/claims', label: 'All Claims Queue', icon: ListFilter },
    { path: '/score', label: 'Real-time Scorer', icon: FileCheck2 },
    { path: '/reviews', label: 'Review Center', icon: ShieldAlert },
    { path: '/insights', label: 'Model Governance', icon: Cpu },
    { path: '/settings', label: 'System Settings', icon: Settings }
  ];

  const currentRoleDetails = ROLE_DETAILS[role] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 998,
            backdropFilter: 'blur(2px)'
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.35)'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                INSURA <span style={{ fontSize: '9px', color: '#06b6d4', padding: '1px 5px', background: 'rgba(6,182,212,0.15)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.3)', fontWeight: 700 }}>s390x</span>
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IBM Z Datathon 2026
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

        {/* Navigation Sections */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Role Workspaces */}
          <div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: '#64748b', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em',
              padding: '0 12px 8px'
            }}>
              Role Workspaces
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ROLE_NAV.map((item) => {
                const Icon = item.icon;
                const isUserRole = user?.role === item.role;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    })}
                    className="nav-link-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {isUserRole && (
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: currentRoleDetails.bg,
                        color: currentRoleDetails.color,
                        fontWeight: 700
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Operations & Triage */}
          <div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: '#64748b', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em',
              padding: '0 12px 8px'
            }}>
              Platform Tools
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {CORE_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    })}
                    className="nav-link-item"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Back to Public Landing */}
          <div style={{ marginTop: 'auto' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} />
              <span>Landing Page Showcase</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentRoleDetails.bg,
              color: currentRoleDetails.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              flexShrink: 0
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
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
      `}</style>
    </>
  );
}
