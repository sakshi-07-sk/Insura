import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  FileCheck,
  Award
} from 'lucide-react';

export function FairnessAnalysis() {
  const ageParity = [
    { cohort: '16 to 20 years', approvalRate: '60.4%', flagRate: '12.8%', disparateImpact: '0.94', status: 'COMPLIANT' },
    { cohort: '21 to 25 years', approvalRate: '62.1%', flagRate: '11.5%', disparateImpact: '0.96', status: 'COMPLIANT' },
    { cohort: '26 to 30 years', approvalRate: '64.0%', flagRate: '9.8%', disparateImpact: '0.99', status: 'COMPLIANT' },
    { cohort: '31 to 40 years', approvalRate: '64.8%', flagRate: '9.2%', disparateImpact: '1.00', status: 'REFERENCE' },
    { cohort: '41 to 50 years', approvalRate: '65.2%', flagRate: '8.9%', disparateImpact: '1.01', status: 'COMPLIANT' },
    { cohort: '51 to 65 years', approvalRate: '63.9%', flagRate: '9.4%', disparateImpact: '0.98', status: 'COMPLIANT' },
    { cohort: 'Over 65 years', approvalRate: '61.8%', flagRate: '10.2%', disparateImpact: '0.95', status: 'COMPLIANT' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Algorithmic Fairness & Responsible AI Audit
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
              4/5ths Rule Verified
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Verification of demographic parity, disparate impact ratios, and bias mitigation across all protected attributes.
          </p>
        </div>
      </div>

      {/* Fairness Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '13px' }}>
            <Award size={18} /> DISPARATE IMPACT RATIO
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
            0.94 - 1.01
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Well above 0.80 legal threshold
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: 700, fontSize: '13px' }}>
            <Scale size={18} /> EQUAL OPPORTUNITY DIFFERENCE
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#06b6d4', marginTop: '8px' }}>
            &plusmn; 0.024
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Near-zero TPR disparity
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: 700, fontSize: '13px' }}>
            <ShieldCheck size={18} /> ETHICAL AI COMPLIANCE
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7', marginTop: '8px' }}>
            100% Certified
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Aligned with Responsible AI Standards
          </div>
        </div>
      </div>

      {/* Cohort Parity Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Demographic Parity Audit: Age of Policyholder
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>AGE COHORT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>FAST-TRACK APPROVAL RATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SIU FLAG RATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DISPARATE IMPACT RATIO</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ETHICAL STATUS</th>
              </tr>
            </thead>
            <tbody>
              {ageParity.map(a => (
                <tr key={a.cohort} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>{a.cohort}</td>
                  <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>{a.approvalRate}</td>
                  <td style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: 600 }}>{a.flagRate}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{a.disparateImpact}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: '#10b981', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 700 
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
