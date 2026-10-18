import React, { useState } from 'react';
import { 
  SearchCheck, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  TrendingDown,
  Info
} from 'lucide-react';

export function FalsePositives() {
  const [cutoff, setCutoff] = useState(0.70);

  // Dynamic simulation based on threshold
  const falsePositiveRate = Math.max(0.5, (1.2 - cutoff) * 4.2).toFixed(1);
  const falsePositiveVolume = Math.round((parseFloat(falsePositiveRate) / 100) * 1420);
  const investigatorHours = (falsePositiveVolume * 3.5).toFixed(0);
  const costFriction = (falsePositiveVolume * 240).toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              False Positive Trade-off & Operational Friction Analysis
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
              Operational Cost Optimization
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Analyze the trade-off between customer payout friction (false positives) versus fraud leakage risk (false negatives).
          </p>
        </div>
      </div>

      {/* Simulator Control */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              SIU Cutoff Threshold Sensitivity Simulator
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
              Adjust the fraud hold cutoff to evaluate real-time investigator workload and policyholder friction.
            </p>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
            {(cutoff * 100).toFixed(0)}% Cutoff
          </div>
        </div>

        <input
          type="range"
          min="0.50"
          max="0.85"
          step="0.05"
          value={cutoff}
          onChange={(e) => setCutoff(parseFloat(e.target.value))}
          style={{ width: '100%', marginTop: '20px', accentColor: '#38bdf8' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FALSE POSITIVE RATE</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{falsePositiveRate}%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Genuine claims delayed</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FLAGGED GENUINE CLAIMS</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{falsePositiveVolume} Claims</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Subject to manual review</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>INVESTIGATOR WORKLOAD</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{investigatorHours} Hours</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Audit time required</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ESTIMATED FRICTION COST</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>${costFriction}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Manual triage overhead</div>
          </div>
        </div>
      </div>

      {/* Root Causes of False Positives */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Top Drivers of Legitimate Claim Flagging
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>1. Minor Parking Lot Accidents Without Police Report (42.8% of FPs)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Policyholders frequently do not file police reports for low-speed parking lot scrapes. The model heavily weights missing police reports, causing benign fender-benders to be flagged.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>2. Newly Acquired Vehicle Policies Under 30 Days (28.4% of FPs)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Claims filed soon after policy inception trigger fraud alerts due to historical early-policy staging rings, despite genuine accidents occurring during initial ownership.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>3. High-Value Sport Vehicle Deductibles (18.2% of FPs)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Luxury sports vehicles naturally feature larger damage totals and $1,000+ deductibles, which overlap statistically with organized luxury vehicle fraud rings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
