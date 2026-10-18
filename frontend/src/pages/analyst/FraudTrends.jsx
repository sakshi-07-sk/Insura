import React from 'react';
import { 
  TrendingUp, 
  Car, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2,
  PieChart
} from 'lucide-react';

export function FraudTrends() {
  const priceBandTrends = [
    { band: 'More than $69,000 (Luxury)', fraudRate: 21.4, volume: 184, trend: '+4.2%' },
    { band: '$40,000 to $59,000', fraudRate: 14.8, volume: 382, trend: '+1.1%' },
    { band: '$30,000 to $39,000', fraudRate: 8.5, volume: 460, trend: '-0.8%' },
    { band: '$20,000 to $29,000', fraudRate: 5.2, volume: 310, trend: '-1.5%' },
    { band: 'Less than $20,000 (Economy)', fraudRate: 4.1, volume: 84, trend: '-0.3%' },
  ];

  const temporalTrends = [
    { day: 'Friday Evening (18:00 - 23:59)', fraudRate: 18.9, note: 'Peak staged accident window' },
    { day: 'Saturday Night', fraudRate: 16.4, note: 'High alcohol involvement and delayed filing' },
    { day: 'Sunday Morning', fraudRate: 12.1, note: 'Unwitnessed weekend claims' },
    { day: 'Midweek (Tue - Thu)', fraudRate: 4.8, note: 'Standard commuter genuine fender-benders' },
    { day: 'Monday Morning', fraudRate: 7.2, note: 'Delayed weekend reporting' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Macro Fraud Trends & Behavioral Patterns
            </h1>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 10px', 
              borderRadius: '20px', 
              border: '1px solid rgba(245, 158, 11, 0.3)' 
            }}>
              Pattern Mining
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Unsupervised and supervised pattern extraction revealing vehicle price correlations, temporal clusters, and seasonal vectors.
          </p>
        </div>
      </div>

      {/* Pattern 1: Vehicle Price Band */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Car size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Fraud Rate by Vehicle Price Band
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {priceBandTrends.map(p => (
            <div key={p.band} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '240px', fontSize: '13px', color: 'var(--text-primary)' }}>
                {p.band}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${p.fraudRate * 4}%`, 
                    height: '100%', 
                    background: p.fraudRate > 15 ? '#ef4444' : (p.fraudRate > 7 ? '#f59e0b' : '#10b981'), 
                    borderRadius: '7px' 
                  }} 
                />
              </div>
              <div style={{ width: '70px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                {p.fraudRate}%
              </div>
              <div style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: p.trend.startsWith('+') ? '#ef4444' : '#10b981' }}>
                {p.trend} QoQ
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern 2: Temporal Clusters */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Calendar size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Temporal Anomalies & Filing Windows
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TIME WINDOW</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>FLAGGED FRAUD RATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>BEHAVIORAL RISK CORRELATE</th>
              </tr>
            </thead>
            <tbody>
              {temporalTrends.map(t => (
                <tr key={t.day} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>{t.day}</td>
                  <td style={{ padding: '14px 16px', color: t.fraudRate > 14 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {t.fraudRate}%
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
