import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListFilter, 
  FileCheck2, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  X,
  Server
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/claims', label: 'Claims Queue', icon: ListFilter },
  { path: '/score', label: 'Score a Claim', icon: FileCheck2 },
  { path: '/reviews', label: 'Review Center', icon: ShieldAlert },
  { path: '/insights', label: 'Model Insights', icon: Cpu },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ isOpen, onClose }) {
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
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
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
          borderBottom: '1px solid var(--sidebar-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', letterSpacing: '-0.01em' }}>
                ClaimGuard AI
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IBM Z Datathon 2026
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '4px',
              display: 'none'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            color: 'var(--sidebar-heading)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em',
            padding: '0 12px 10px'
          }}>
            Triage & Analysis
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  })}
                  className="nav-link-item"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Deployment Target Info Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: '#0a0f1d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px' }}>
            <Server size={14} style={{ color: '#3b82f6' }} />
            <span>Target: IBM LinuxONE (`s390x`)</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            High-throughput enterprise AI inference
          </div>
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
          background-color: var(--sidebar-hover);
          color: #ffffff;
        }
      `}</style>
    </>
  );
}
