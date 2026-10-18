import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileCode2, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Server, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export function ModelReports() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportModelCard = () => {
    setDownloadSuccess(true);
    const content = `# MODEL GOVERNANCE CARD — INSURA AI
Model: RandomForestClassifier Pipeline (v1.0.0)
Architecture: Calibrated Ensemble with StandardScaler & OneHotEncoder
Hardware: IBM LinuxONE Enterprise Server (s390x)
Inference Latency: ~18ms

## EVALUATION METRICS
- ROC-AUC: 84.7%
- Precision: 84.1%
- Recall: 79.7%
- Specificity: 98.9%
- F1-Score: 0.805

## INTENDED USE & SCOPE
- Authorized: Triaging claims into Fast-Track (<0.30) and SIU Review (>=0.70).
- Prohibited: Sole automated denial of any insurance benefit. Human adjuster review required.

## FAIRNESS & ETHICAL AUDIT
- Disparate Impact: 0.94 - 1.01 across Age categories.
- Compliant with EU AI Act High-Risk AI System obligations.
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insura_model_card_v1.0.0.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AI Model Governance & Regulatory Dossiers
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
              Model Card v1.0.0
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Comprehensive model card, data lineage specification, and compliance audit for regulatory oversight.
          </p>
        </div>

        <button
          onClick={handleExportModelCard}
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
          {downloadSuccess ? 'Model Card Exported!' : 'Export Model Card'}
        </button>
      </div>

      {/* Model Specifications */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Model Card: Insura-RandomForest-v1.0.0
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Developed by Member 1 (ML Engineer) & Member 2 (FastAPI Backend) • Deployed on IBM LinuxONE
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>INTENDED USE</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
              Assists insurance underwriters and claims adjusters in detecting potentially fraudulent motor vehicle claims while expediting low-risk customer claims.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>OUT-OF-SCOPE USE</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
              Prohibited from executing automated claim denials without human reviewer validation. Never used for health or life insurance decisions.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>DATASET & TRAINING</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
              Trained on 15,420 historical vehicle accident records containing 33 structured features across driver demographics, policy types, and incident telemetry.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase' }}>HARDWARE EXECUTION</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
              Rootless Podman container running on IBM LinuxONE III (s390x mainframe architecture) with native hardware security and encrypted persistent volumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
