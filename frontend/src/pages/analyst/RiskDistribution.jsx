import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  Filter, 
  Download, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export function RiskDistribution() {
  const [segment, setSegment] = useState('ALL');

  // Risk Score Deciles
  const deciles = [
    { range: '0.00 - 0.10', count: 542, pct: 38.2, tier: 'Fast-Track' },
    { range: '0.10 - 0.20', count: 234, pct: 16.5, tier: 'Fast-Track' },
    { range: '0.20 - 0.30', count: 116, pct: 8.1, tier: 'Fast-Track' },
    { range: '0.30 - 0.40', count: 98, pct: 6.9, tier: 'Standard Review' },
    { range: '0.40 - 0.50', count: 142, pct: 10.0, tier: 'Standard Review' },
    { range: '0.50 - 0.60', count: 110, pct: 7.7, tier: 'Standard Review' },
    { range: '0.60 - 0.70', count: 64, pct: 4.5, tier: 'Standard Review' },
    { range: '0.70 - 0.80', count: 48, pct: 3.4, tier: 'SIU Investigation' },
    { range: '0.80 - 0.90', count: 42, pct: 3.0, tier: 'SIU Investigation' },
    { range: '0.90 - 1.00', count: 24, pct: 1.7, tier: 'SIU Investigation' },
  ];

  const vehicleDist = [
    { make: 'Honda / Toyota', low: 78, med: 18, high: 4 },
    { make: 'Ford / Chevrolet', low: 66, med: 26, high: 8 },
    { make: 'BMW / Mercedes', low: 44, med: 36, high: 20 },
    { make: 'Mazda / Nissan', low: 72, med: 21, high: 7 },
    { make: 'Porsche / Ferrari', low: 31, med: 39, high: 30 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Portfolio Risk Score Distribution & Decile Analysis
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
              1,420 Scored Claims
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Probability density function of model risk predictions, binned into 10% deciles and sliced across vehicle segments.
          </p>
        </div>
      </div>

      {/* Decile Distribution Breakdown */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Risk Probability Decile Density
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deciles.map(d => {
            const isLow = d.tier === 'Fast-Track';
            const isHigh = d.tier === 'SIU Investigation';
            const color = isLow ? '#10b981' : (isHigh ? '#ef4444' : '#f59e0b');

            return (
              <div key={d.range} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '110px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {d.range}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${d.pct * 2.2}%`, 
                      height: '100%', 
                      background: color, 
                      borderRadius: '7px' 
                    }} 
                  />
                </div>
                <div style={{ width: '70px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {d.count} ({d.pct}%)
                </div>
                <div style={{ width: '140px', textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: color, 
                    background: `${color}18`, 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    border: `1px solid ${color}40`
                  }}>
                    {d.tier}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vehicle Segment Cross-Tabulation */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Risk Proportions by Vehicle Category Cohort
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>VEHICLE SEGMENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#10b981' }}>FAST-TRACK (&lt; 30%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#f59e0b' }}>STANDARD REVIEW (30-70%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#ef4444' }}>SIU HOLD (&ge; 70%)</th>
              </tr>
            </thead>
            <tbody>
              {vehicleDist.map(v => (
                <tr key={v.make} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>{v.make}</td>
                  <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>{v.low}%</td>
                  <td style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: 600 }}>{v.med}%</td>
                  <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 600 }}>{v.high}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
