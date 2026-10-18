import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Cpu, 
  Database, 
  Users, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileText,
  Sliders,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth, ROLE_DETAILS, ROLES } from '../../context/AuthContext';

export function AdminDashboard() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [usersCount, setUsersCount] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [health, model, statsRes, usersRes] = await Promise.allSettled([
        api.checkHealth(),
        api.getModelInfo(),
        api.getDashboardStats(),
        api.getUsers()
      ]);
      if (health.status === 'fulfilled') setHealthData(health.value);
      if (model.status === 'fulfilled') setModelInfo(model.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) setUsersCount(usersRes.value.length);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Platform Governance & Infrastructure
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
              Admin Overview
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Enterprise administration: infrastructure telemetry, access control, audit governance, and ML operational assurance
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

      {/* KPI Tiles */}
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
            Backend & Nginx Reverse Proxy
          </div>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Platform Users</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {usersCount} Accounts
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '6px' }}>
            PBKDF2 Salted Auth Active
          </div>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Ingested Claims</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.total_claims || 5} Records
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Persistent SQLite / Postgres Volume
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Administrative Governance Modules
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            {
              title: 'User Management & Provisioning',
              desc: 'Inspect registered accounts, filter by role, create users, and reassign RBAC authority.',
              icon: Users,
              path: '/admin/users',
              badge: 'RBAC',
              color: '#06b6d4'
            },
            {
              title: 'Role & Access Control Matrix',
              desc: 'Review granular permission definitions and zero-trust security policies for all roles.',
              icon: ShieldCheck,
              path: '/admin/access',
              badge: 'Security',
              color: '#10b981'
            },
            {
              title: 'All Claims Governance Queue',
              desc: 'Cross-organization view of every ingested claim, model score, and adjudication stage.',
              icon: Layers,
              path: '/admin/claims',
              badge: 'Claims',
              color: '#38bdf8'
            },
            {
              title: 'System Health & Telemetry',
              desc: 'Real-time LinuxONE host telemetry, s390x execution metrics, and latency diagnostics.',
              icon: Activity,
              path: '/admin/health',
              badge: 'Infrastructure',
              color: '#10b981'
            },
            {
              title: 'Platform Audit Logs',
              desc: 'Immutable audit trail of user access, model score events, and security elevation actions.',
              icon: FileText,
              path: '/admin/audit',
              badge: 'Compliance',
              color: '#f59e0b'
            },
            {
              title: 'Model Configuration & Thresholds',
              desc: 'Inspect Scikit-Learn RandomForest hyperparameters, feature dimensions, and risk boundaries.',
              icon: Cpu,
              path: '/admin/model-config',
              badge: 'ML Engine',
              color: '#8b5cf6'
            }
          ].map(module => {
            const Icon = module.icon;
            return (
              <Link
                key={module.path}
                to={module.path}
                className="card"
                style={{
                  padding: '22px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${module.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color={module.color} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: `${module.color}18`,
                      color: module.color,
                      border: `1px solid ${module.color}35`
                    }}>
                      {module.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {module.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {module.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: module.color, fontSize: '13px', fontWeight: 600, marginTop: '16px' }}>
                  <span>Open Module</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
