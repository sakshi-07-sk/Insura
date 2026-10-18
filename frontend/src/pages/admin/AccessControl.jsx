import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileCheck2,
  Server
} from 'lucide-react';
import { ROLES, ROLE_DETAILS } from '../../context/AuthContext';

export function AccessControl() {
  const RBAC_PERMISSIONS = [
    {
      capability: 'Claim Intake & Creation',
      desc: 'Submit new claim feature payloads for real-time risk scoring',
      admin: true,
      officer: true,
      investigator: false,
      analyst: false,
    },
    {
      capability: 'Real-Time ML Scoring Execution',
      desc: 'Execute Scikit-Learn RandomForest inference pipeline on s390x',
      admin: true,
      officer: true,
      investigator: true,
      analyst: true,
    },
    {
      capability: 'Access SIU Investigation Queue',
      desc: 'View flagged claims, fraud probability scores, and contributing features',
      admin: true,
      officer: false,
      investigator: true,
      analyst: false,
    },
    {
      capability: 'Adjudicate Claims (Clear / Escalate)',
      desc: 'Record binding review decisions and legal notes in persistent audit log',
      admin: true,
      officer: false,
      investigator: true,
      analyst: false,
    },
    {
      capability: 'Model Performance & PR-AUC Evaluation',
      desc: 'Inspect precision, recall, F1-score, ROC curves, and confusion matrix',
      admin: true,
      officer: false,
      investigator: false,
      analyst: true,
    },
    {
      capability: 'Demographic Fairness & Bias Auditing',
      desc: 'Analyze demographic parity across vehicle prices, age bands, and driver ratings',
      admin: true,
      officer: false,
      investigator: false,
      analyst: true,
    },
    {
      capability: 'User Provisioning & Role Reassignment',
      desc: 'Create accounts, reassign RBAC authority, and deactivate users',
      admin: true,
      officer: false,
      investigator: false,
      analyst: false,
    },
    {
      capability: 'System Telemetry & Podman Management',
      desc: 'Access LinuxONE hardware diagnostics, container status, and DB migrations',
      admin: true,
      officer: false,
      investigator: false,
      analyst: false,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Role-Based Access Control (RBAC) & Governance
          </h1>
          <span style={{ 
            background: 'rgba(16, 185, 129, 0.15)', 
            color: '#10b981', 
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '3px 10px', 
            borderRadius: '20px', 
            border: '1px solid rgba(16, 185, 129, 0.3)' 
          }}>
            Zero-Trust Policy
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
          Enforce strict least-privilege security policies across all operational roles on IBM LinuxONE
        </p>
      </div>

      {/* RBAC Matrix Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <div>
            <h2 className="card-title">
              <ShieldCheck size={20} color="#10b981" />
              Granular Permission Enforcement Matrix
            </h2>
            <div className="card-subtitle">
              Verified on both client-side route guards and FastAPI backend endpoint dependencies
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Active Security Policy
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Platform Capability / Action</th>
                <th style={{ textAlign: 'center', color: '#06b6d4' }}>Admin</th>
                <th style={{ textAlign: 'center', color: '#10b981' }}>Claims Officer</th>
                <th style={{ textAlign: 'center', color: '#ef4444' }}>Investigator</th>
                <th style={{ textAlign: 'center', color: '#8b5cf6' }}>Risk Analyst</th>
              </tr>
            </thead>
            <tbody>
              {RBAC_PERMISSIONS.map((perm, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      {perm.capability}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {perm.desc}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {perm.admin ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                        <CheckCircle2 size={16} />
                      </span>
                    ) : (
                      <span style={{ color: '#475569' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {perm.officer ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        <CheckCircle2 size={16} />
                      </span>
                    ) : (
                      <span style={{ color: '#475569' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {perm.investigator ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        <CheckCircle2 size={16} />
                      </span>
                    ) : (
                      <span style={{ color: '#475569' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {perm.analyst ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                        <CheckCircle2 size={16} />
                      </span>
                    ) : (
                      <span style={{ color: '#475569' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Architecture Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <Key size={18} color="#06b6d4" />
              Token & Session Governance
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
            Standard RFC 7519 JSON Web Tokens signed with HMAC-SHA256. Tokens embed user role claims checked on every protected API call.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Signing Algorithm</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>HS256 (HMAC-SHA256)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Token Expiration</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>7 Days (Auto-Refresh)</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <Lock size={18} color="#10b981" />
              Cryptographic Password Security
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
            Passwords are never stored in plaintext. Passwords are hash-stretched using PBKDF2 with unique cryptographic salt per user.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>KDF Algorithm</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>PBKDF2-HMAC-SHA256</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Iteration Count</span>
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>100,000 Rounds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
