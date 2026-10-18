import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Mail, 
  Key, 
  Server, 
  Cpu, 
  CheckCircle2, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth, ROLE_DETAILS, ROLES, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const currentRoleDetails = ROLE_DETAILS[role] || ROLE_DETAILS[ROLES.CLAIMS_OFFICER];
  const [copied, setCopied] = useState(false);

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    const target = ROLE_DETAILS[newRole]?.defaultRoute || '/claims/dashboard';
    navigate(target);
  };

  const copyToken = () => {
    const token = localStorage.getItem('insura_auth_token') || 'demo-jwt-linuxone-s390x';
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(37, 99, 235, 0.15))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: currentRoleDetails.bg,
              border: `2px solid ${currentRoleDetails.color}`,
              color: currentRoleDetails.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            {user?.initials || 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {user?.name || 'Authorized User'}
              </h1>
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '14px',
                  background: currentRoleDetails.bg,
                  color: currentRoleDetails.color,
                  border: `1px solid ${currentRoleDetails.color}40`
                }}
              >
                {currentRoleDetails.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: '#94a3b8', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} />
                {user?.email || 'user@insura.ai'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={15} />
                LinuxONE s390x
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Profile Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Account & Role Authority */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <ShieldCheck size={20} color={currentRoleDetails.color} />
              Role Authority & Permissions
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
            {currentRoleDetails.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Assigned Workspace</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentRoleDetails.defaultRoute}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Session Security</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>PBKDF2 Salted / JWT Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Execution Architecture</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>IBM LinuxONE (s390x)</span>
            </div>
          </div>
        </div>

        {/* Demo Role Switcher */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <RefreshCw size={20} color="#06b6d4" />
              Switch Active Role (Demo Mode)
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
            Seamlessly test each distinct role dashboard and tailored navigation during demonstration:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const details = ROLE_DETAILS[acc.role];
              const isCurrent = acc.role === role;
              return (
                <button
                  key={acc.role}
                  onClick={() => handleRoleSwitch(acc.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isCurrent ? details.bg : 'rgba(255,255,255,0.03)',
                    border: isCurrent ? `1px solid ${details.color}` : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: details.bg,
                      color: details.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {acc.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                        {details.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: details.color }}>
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Security Token & API Connection */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div className="card-title">
            <Key size={20} color="#f59e0b" />
            Active Session Token
          </div>
          <button
            onClick={copyToken}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: copied ? '#34d399' : '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copied ? 'Copied!' : 'Copy Token'}
          </button>
        </div>
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#94a3b8',
          wordBreak: 'break-all'
        }}>
          {localStorage.getItem('insura_auth_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token-linuxone-s390x'}
        </div>
      </div>
    </div>
  );
}
