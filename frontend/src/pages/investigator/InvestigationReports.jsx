import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  ShieldAlert, 
  FileCheck, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export function InvestigationReports() {
  const [selectedReport, setSelectedReport] = useState('quarterly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Special Investigation Reports & Legal Dossiers
            </h1>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#3b82f6', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(59, 130, 246, 0.3)' 
            }}>
              SIU Governance
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Generate executive fraud detection summaries, legal prosecution dossiers, and audit-ready claim reviews.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Download size={15} />
          {isGenerating ? 'Compiling Dossier...' : (downloadSuccess ? 'Dossier Downloaded!' : 'Export Executive Dossier')}
        </button>
      </div>

      {/* KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SIU CONVICTION & INTERCEPTION RATE</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            94.6%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified fraud cases successfully upheld
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE CASE RESOLUTION TIME</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            3.2 Days
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Down from 18.4 days pre-AI automation
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL FINANCIAL LOSS PREVENTION</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            $1.42M
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Annualized across 2026 portfolio
          </div>
        </div>
      </div>

      {/* Report Template Selector & Live Preview */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedReport('quarterly')}
            style={{
              background: selectedReport === 'quarterly' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              border: selectedReport === 'quarterly' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              color: selectedReport === 'quarterly' ? '#06b6d4' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Quarterly SIU Executive Summary
          </button>
          <button
            onClick={() => setSelectedReport('ring')}
            style={{
              background: selectedReport === 'ring' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: selectedReport === 'ring' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
              color: selectedReport === 'ring' ? '#ef4444' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Organized Fraud Ring Dossier
          </button>
          <button
            onClick={() => setSelectedReport('concordance')}
            style={{
              background: selectedReport === 'concordance' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: selectedReport === 'concordance' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
              color: selectedReport === 'concordance' ? '#8b5cf6' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Human Adjuster vs AI Concordance
          </button>
        </div>

        {/* Live Document Preview */}
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                INSURA INTELLIGENCE PLATFORM • CONFIDENTIAL SIU AUDIT
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                {selectedReport === 'quarterly' ? 'Q1 2026 Insurance Claim Fraud & Risk Report' : 
                 (selectedReport === 'ring' ? 'Coordinated Vehicle Fraud Syndicate Investigation' : 'Model Predictive Calibration & Concordance Review')}
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Ref: SIU-REP-2026-88
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <p>
              <strong>Executive Summary:</strong> Over the recent operational period, Insura processed over 1,420 automobile insurance claims across diverse policy categories. The AI risk inference pipeline successfully triaged 62.8% of claims into the Automated Fast-Track pathway (&lt;0.30 risk score), delivering immediate payout disbursements within 2 hours.
            </p>
            <p>
              <strong>Special Investigation Findings:</strong> Exactly 14 high-risk claims exceeded the 0.70 risk threshold and were intercepted before fund disbursement. Analysis revealed recurring patterns: absence of formal police reports, mismatched vehicle price bands, and claim filings within 30 days of policy origination. Total capital protected against fraudulent claims exceeds $1.42 million.
            </p>
            <p>
              <strong>Infrastructure Assurance:</strong> All inference requests were computed natively on the IBM LinuxONE enterprise system (s390x) running containerized FastAPI and scikit-learn microservices, demonstrating sub-20ms latency and 100% uptime with zero data loss across persistent SQLite volumes.
            </p>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Authorized by: <strong style={{ color: '#ffffff' }}>Special Investigation Unit Lead</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> Cryptographically Signed & Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
