import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444'
};

const STATUS_COLORS = {
  'PENDING_REVIEW': '#7c3aed',
  'UNDER_REVIEW': '#3b82f6',
  'CLEARED': '#10b981',
  'ESCALATED': '#f43f5e'
};

const STATUS_LABELS = {
  'PENDING_REVIEW': 'Pending Review',
  'UNDER_REVIEW': 'Under Review',
  'CLEARED': 'Cleared / Fast-Track',
  'ESCALATED': 'Escalated to SIU'
};

export function RiskDistributionChart({ riskCategoryCounts, reviewStatusCounts }) {
  // Format Risk Category Data
  const riskData = [
    { name: 'Low Risk', tier: 'LOW', count: riskCategoryCounts?.LOW || 0, color: RISK_COLORS.LOW },
    { name: 'Medium Risk', tier: 'MEDIUM', count: riskCategoryCounts?.MEDIUM || 0, color: RISK_COLORS.MEDIUM },
    { name: 'High Risk', tier: 'HIGH', count: riskCategoryCounts?.HIGH || 0, color: RISK_COLORS.HIGH }
  ];

  // Format Review Status Data
  const statusData = Object.entries(reviewStatusCounts || {}).map(([key, val]) => ({
    key,
    name: STATUS_LABELS[key] || key,
    value: val,
    color: STATUS_COLORS[key] || '#94a3b8'
  }));

  const totalClaims = (riskCategoryCounts?.LOW || 0) + (riskCategoryCounts?.MEDIUM || 0) + (riskCategoryCounts?.HIGH || 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', margin: '20px 0' }}>
      {/* Risk Category Distribution */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Risk Category Triage Distribution</div>
            <div className="card-subtitle">Claim categorization by ML fraud probability threshold</div>
          </div>
        </div>

        {totalClaims === 0 ? (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No claim records available
          </div>
        ) : (
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip 
                  formatter={(value, name, item) => [`${value} Claims (${totalClaims ? Math.round((value / totalClaims) * 100) : 0}%)`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
          {riskData.map((item) => (
            <div key={item.tier} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.name}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: item.color }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Workflow Status Distribution */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Adjuster Review Workflow Status</div>
            <div className="card-subtitle">Operational status of claims across human triage pipelines</div>
          </div>
        </div>

        {totalClaims === 0 ? (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No claim records available
          </div>
        ) : (
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} Claims`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          Human-in-the-loop: Scores prioritize reviews; final determinations remain with adjusters.
        </div>
      </div>
    </div>
  );
}
