import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { api, getApiBaseUrl } from '../services/api';
import { useAuth, DEMO_ACCOUNTS, ROLES, ROLE_DETAILS } from '../context/AuthContext';

export function AdminDashboardPage() {
  const { user, switchRole } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usersList, setUsersList] = useState(DEMO_ACCOUNTS);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User Elevated', detail: 'Elena Rostova granted SIU Lead status', user: 'admin@insura.ai', time: '10 mins ago', type: 'info' },
    { id: 2, action: 'Model Verification', detail: 'Checksum verified for risk_model.joblib on s390x', user: 'system', time: '25 mins ago', type: 'success' },
    { id: 3, action: 'High-Risk Alert', detail: 'Claim CLM-4921 triggered score 84.2 (Investigation flagged)', user: 'officer@insura.ai', time: '42 mins ago', type: 'warning' },
    { id: 4, action: 'Container Restart', detail: 'Podman rootless backend healthy at port 8000', user: 'system', time: '2 hours ago', type: 'info' },
    { id: 5, action: 'Database Check', detail: 'SQLite/PostgreSQL schema migrations verified', user: 'system', time: '3 hours ago', type: 'success' }
  ]);

  const loadData = async () => {
    try {
      const [health, model] = await Promise.allSettled([
        api.checkHealth(),
        api.getModelInfo()
      ]);
      if (health.status === 'fulfilled') setHealthData(health.value);
      if (model.status === 'fulfilled') setModelInfo(model.value);
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleRoleChange = (email, newRole) => {
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    setAuditLogs(prev => [
      {
        id: Date.now(),
        action: 'Role Modified',
        detail: `Updated ${email} role to ${ROLE_DETAILS[newRole]?.name || newRole}`,
        user: user.email,
        time: 'Just now',
        type: 'info'
      },
      ...prev
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Platform Governance & Infrastructure
            </h1>
            <span style={{ 
              background: 'rgba(6, 182, 212, 0.15)', 
              color: '#06b6d4', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 8px', 
              borderRadius: '20px', 
              border: '1px solid rgba(6, 182, 212, 0.3)' 
            }}>
              IBM LinuxONE s390x
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
            System telemetry, rootless container health, role-based access control, and audit trail
          </p>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* Telemetry Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: LinuxONE Host */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Architecture</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            IBM s390x
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> LinuxONE Community Cloud
          </div>
        </div>

        {/* Card 2: Container Status */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Podman Containers</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            2 Active
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Backend & Nginx Reverse Proxy
          </div>
        </div>

        {/* Card 3: Model Health */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Inference Engine</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {modelInfo?.model_loaded ? 'Live Loaded' : 'Available'}
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '6px' }}>
            RandomForest (140 Features)
          </div>
        </div>

        {/* Card 4: Database Persistence */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Database Storage</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Persistent
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Rootless Volume Mounted
          </div>
        </div>
      </div>

      {/* Main Content Grid: User Management & Audit Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '20px' }}>
        {/* User Provisioning Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                User Provisioning & Roles
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {usersList.length} Active Accounts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Current Role</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Reassign Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const details = ROLE_DETAILS[u.role];
                  return (
                    <tr key={u.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: details?.bg || 'rgba(255,255,255,0.1)',
                            color: details?.color || '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}>
                            {u.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: details?.bg,
                          color: details?.color
                        }}>
                          {details?.name}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.email, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {Object.entries(ROLE_DETAILS).map(([rKey, rVal]) => (
                            <option key={rKey} value={rKey}>
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

        {/* Audit & Activity Logs */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Security & Audit Trail
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Live Logging
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map((log) => {
              const badgeColors = {
                info: { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
                warning: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                success: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
              }[log.type] || { text: '#94a3b8', bg: 'rgba(255, 255, 255, 0.05)' };

              return (
                <div 
                  key={log.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badgeColors.bg,
                        color: badgeColors.text,
                        textTransform: 'uppercase'
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        by {log.user}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {log.detail}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Governance Banner */}
      <div 
        style={{
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.08))',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={20} color="#06b6d4" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              Governance Lock: Model weights and pipeline immutable in production
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Artifact: <code>risk_model.joblib</code> (Ubuntu 24.04 s390x verified, Scikit-Learn 1.4.2)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Production Certified
          </span>
        </div>
      </div>
    </div>
  );
}
