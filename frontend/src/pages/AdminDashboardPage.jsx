import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Users, 
  ShieldAlert, 
  Activity, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Clock, 
  Lock,
  ArrowUpRight,
  UserCheck,
  Search,
  ShieldCheck,
  FileText,
  Key,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api, getApiBaseUrl } from '../services/api';
import { useAuth, DEMO_ACCOUNTS, ROLES, ROLE_DETAILS } from '../context/AuthContext';

export function AdminDashboardPage() {
  const location = useLocation();
  const { user } = useAuth();

  const [healthData, setHealthData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [usersList, setUsersList] = useState(DEMO_ACCOUNTS);
  const [auditFilter, setAuditFilter] = useState('ALL');

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User Elevated', detail: 'Elena Rostova granted SIU Lead status', user: 'admin@insura.ai', time: '10 mins ago', type: 'info' },
    { id: 2, action: 'Model Verification', detail: 'Checksum verified for risk_model.joblib on s390x', user: 'system', time: '25 mins ago', type: 'success' },
    { id: 3, action: 'High-Risk Alert', detail: 'Claim CLM-4921 triggered score 84.2 (Investigation flagged)', user: 'officer@insura.ai', time: '42 mins ago', type: 'warning' },
    { id: 4, action: 'Container Health', detail: 'Podman rootless backend healthy at port 8000', user: 'system', time: '2 hours ago', type: 'info' },
    { id: 5, action: 'Database Ping', detail: 'SQLite/PostgreSQL schema migrations verified', user: 'system', time: '3 hours ago', type: 'success' },
    { id: 6, action: 'Auth Token Issued', detail: 'JWT session authenticated for David Okafor (Analyst)', user: 'system', time: '4 hours ago', type: 'info' }
  ]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [health, model, users] = await Promise.allSettled([
        api.checkHealth(),
        api.getModelInfo(),
        api.getUsers()
      ]);
      if (health.status === 'fulfilled') setHealthData(health.value);
      if (model.status === 'fulfilled') setModelInfo(model.value);
      if (users.status === 'fulfilled' && Array.isArray(users.value) && users.value.length > 0) {
        setUsersList(users.value.map(u => ({
          ...u,
          name: u.full_name,
          initials: (u.full_name || u.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (email, newRole, userId) => {
    // Optimistic local update
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    setAuditLogs(prev => [
      {
        id: Date.now(),
        action: 'Role Modified',
        detail: `Updated ${email} role to ${ROLE_DETAILS[newRole]?.name || newRole}`,
        user: user?.email || 'admin@insura.ai',
        time: 'Just now',
        type: 'info'
      },
      ...prev
    ]);

    // Backend update if user ID is known
    if (userId) {
      try {
        await api.updateUserRole(userId, newRole);
      } catch (err) {
        console.warn('Backend role update failed:', err);
      }
    }
  };

  // Determine current active view based on path
  const currentPath = location.pathname;
  const isUsersView = currentPath === '/admin/users';
  const isAccessView = currentPath === '/admin/access';
  const isHealthView = currentPath === '/admin/health';
  const isAuditView = currentPath === '/admin/audit';
  const isModelConfigView = currentPath === '/admin/model-config';
  const isOverview = !isUsersView && !isAccessView && !isHealthView && !isAuditView && !isModelConfigView;

  const filteredUsers = usersList.filter(u => 
    !userSearch || 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAudit = auditLogs.filter(log => 
    auditFilter === 'ALL' || log.type === auditFilter
  );

  // RBAC Matrix Data
  const RBAC_PERMISSIONS = [
    { permission: 'Submit & Ingest Claims', admin: true, officer: true, investigator: false, analyst: false },
    { permission: 'Real-Time Risk Scoring', admin: true, officer: true, investigator: true, analyst: true },
    { permission: 'View Flagged Investigation Queue', admin: true, officer: false, investigator: true, analyst: false },
    { permission: 'Decide Reviews (Cleared / Escalated)', admin: true, officer: false, investigator: true, analyst: false },
    { permission: 'Model Evaluation & ROC/PR Analytics', admin: true, officer: false, investigator: false, analyst: true },
    { permission: 'Fairness & Demographic Bias Auditing', admin: true, officer: false, investigator: false, analyst: true },
    { permission: 'User Provisioning & Role Reassignment', admin: true, officer: false, investigator: false, analyst: false },
    { permission: 'System Infrastructure Telemetry', admin: true, officer: false, investigator: false, analyst: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isUsersView ? 'User Provisioning & Account Management' :
               isAccessView ? 'Role-Based Access Control (RBAC)' :
               isHealthView ? 'System Health & Infrastructure Telemetry' :
               isAuditView ? 'Security Audit Trail & Governance Logs' :
               isModelConfigView ? 'Model Runtime Configuration & Thresholds' :
               'Platform Governance & Infrastructure'}
            </h1>
            <span style={{ 
              background: 'rgba(6, 182, 212, 0.15)', 
              color: '#06b6d4', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(6, 182, 212, 0.3)' 
            }}>
              IBM LinuxONE s390x
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Enterprise administrator workspace: infrastructure observability, access enforcement, and model assurance
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '10px 18px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Quick View Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { path: '/admin/dashboard', label: 'Overview', icon: Layers },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/access', label: 'Access Control', icon: ShieldCheck },
          { path: '/admin/health', label: 'System Health', icon: Activity },
          { path: '/admin/audit', label: 'Audit Logs', icon: FileText },
          { path: '/admin/model-config', label: 'Model Config', icon: Cpu },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path || (tab.path === '/admin/dashboard' && isOverview);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? '#06b6d4' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Telemetry Cards Grid (Shown on Overview and Health) */}
      {(isOverview || isHealthView) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Architecture</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} color="#06b6d4" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              IBM s390x
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> LinuxONE Community Cloud
            </div>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Container Isolation</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={18} color="#10b981" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rootless Podman
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Non-privileged security profile
            </div>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Model Inference</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={18} color="#8b5cf6" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Live Loaded
            </div>
            <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '6px' }}>
              Scikit-Learn 1.4.2 (140 Features)
            </div>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Database Storage</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} color="#f59e0b" />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Persistent Volume
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              SQLite / PostgreSQL Resilient
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Users Management (Shown on Overview or Users tab) */}
      {(isOverview || isUsersView) && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  User Provisioning & Role Assignments
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Assign corporate privileges with instant RBAC enforcement
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    color: '#ffffff',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 600 }}>
                {filteredUsers.length} Accounts
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identity & Email</th>
                  <th>Current Role</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Reassign Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const details = ROLE_DETAILS[u.role] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];
                  return (
                    <tr key={u.email}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: details.bg,
                            color: details.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            border: `1px solid ${details.color}40`
                          }}>
                            {u.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                              {u.name || u.full_name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: details.bg,
                          color: details.color,
                          border: `1px solid ${details.color}30`
                        }}>
                          {details.name}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                          <CheckCircle2 size={14} /> Active
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.email, e.target.value, u.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {Object.entries(ROLE_DETAILS).map(([rKey, rVal]) => (
                            <option key={rKey} value={rKey} style={{ background: '#0a1122', color: '#ffffff' }}>
                              {rVal.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: Role & Access Control Matrix (Shown on Access tab) */}
      {(isAccessView || isOverview) && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  RBAC Privilege Enforcement Matrix
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Granular permission distribution enforced across FastAPI backend and frontend guards
                </span>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Strict Zero-Trust RBAC
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Platform Capability / Operation</th>
                  <th style={{ color: '#06b6d4', textAlign: 'center' }}>Admin</th>
                  <th style={{ color: '#10b981', textAlign: 'center' }}>Claims Officer</th>
                  <th style={{ color: '#ef4444', textAlign: 'center' }}>Fraud Investigator</th>
                  <th style={{ color: '#8b5cf6', textAlign: 'center' }}>Risk Analyst</th>
                </tr>
              </thead>
              <tbody>
                {RBAC_PERMISSIONS.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{row.permission}</td>
                    <td style={{ textAlign: 'center' }}>
                      {row.admin ? <CheckCircle2 size={16} color="#06b6d4" style={{ margin: '0 auto' }} /> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.officer ? <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.investigator ? <CheckCircle2 size={16} color="#ef4444" style={{ margin: '0 auto' }} /> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.analyst ? <CheckCircle2 size={16} color="#8b5cf6" style={{ margin: '0 auto' }} /> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: Audit Trail (Shown on Overview or Audit tab) */}
      {(isOverview || isAuditView) && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Platform Security & Audit Trail
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Immutable log of user operations, ML evaluations, and container events
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'info', 'warning', 'success'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAuditFilter(lvl)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: auditFilter === lvl ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: auditFilter === lvl ? '#06b6d4' : '#94a3b8',
                    border: auditFilter === lvl ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAudit.map((log) => {
              const badgeColors = {
                info: { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
                warning: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                success: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
              }[log.type] || { text: '#94a3b8', bg: 'rgba(255, 255, 255, 0.05)' };

              return (
                <div 
                  key={log.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: badgeColors.bg,
                        color: badgeColors.text,
                        textTransform: 'uppercase'
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        actor: <strong>{log.user}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {log.detail}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: Model Runtime Configuration (Shown on Overview or Model-Config tab) */}
      {(isOverview || isModelConfigView) && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={20} color="#8b5cf6" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Model Configuration & Inference Parameters
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Member 1 verified model artifact and scoring threshold definitions
                </span>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Certified Immutable
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Trained Estimator</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>RandomForestClassifier</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>100 Estimators • max_depth=12</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>High-Risk Boundary</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>Fraud Prob ≥ 0.70</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Mandatory SIU Investigation</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Low-Risk Fast-Track</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>Fraud Prob &lt; 0.30</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Automated Payout Clearance</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Target Architecture</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#06b6d4', marginTop: '4px' }}>s390x (Big-Endian Compatible)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Ubuntu 24.04 LinuxONE Host</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
