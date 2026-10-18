import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileStack, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Send,
  Zap,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { ClaimDetailsDrawer } from '../components/claims/ClaimDetailsDrawer';

const PRESET_SCENARIOS = {
  genuine: {
    label: 'Standard Genuine Claim (Sedan)',
    data: {
      Month: 'Jan',
      WeekOfMonth: 2,
      DayOfWeek: 'Wednesday',
      Make: 'Honda',
      AccidentArea: 'Urban',
      DayOfWeekClaimed: 'Friday',
      MonthClaimed: 'Jan',
      WeekOfMonthClaimed: 2,
      Sex: 'Female',
      MaritalStatus: 'Married',
      Age: 46,
      Fault: 'Policy Holder',
      PolicyType: 'Sedan - Liability',
      VehicleCategory: 'Sedan',
      VehiclePrice: '20000 to 29000',
      Deductible: 400,
      DriverRating: 1,
      Days_Policy_Accident: 'more than 30',
      Days_Policy_Claim: 'more than 30',
      PastNumberOfClaims: 'none',
      AgeOfVehicle: '5 years',
      AgeOfPolicyHolder: '41 to 50',
      PoliceReportFiled: 'No',
      WitnessPresent: 'No',
      AgentType: 'External',
      NumberOfSuppliments: 'none',
      AddressChange_Claim: 'no change',
      NumberOfCars: '1 vehicle',
      Year: 2024,
      BasePolicy: 'Liability'
    }
  },
  suspicious: {
    label: 'Suspicious High-Value Claim (Third Party / Sports)',
    data: {
      Month: 'Dec',
      WeekOfMonth: 4,
      DayOfWeek: 'Friday',
      Make: 'Accura',
      AccidentArea: 'Urban',
      DayOfWeekClaimed: 'Monday',
      MonthClaimed: 'Dec',
      WeekOfMonthClaimed: 5,
      Sex: 'Male',
      MaritalStatus: 'Single',
      Age: 25,
      Fault: 'Third Party',
      PolicyType: 'Sport - All Perils',
      VehicleCategory: 'Sport',
      VehiclePrice: 'more than 69000',
      Deductible: 1000,
      DriverRating: 4,
      Days_Policy_Accident: '8 to 15',
      Days_Policy_Claim: '8 to 15',
      PastNumberOfClaims: 'more than 4',
      AgeOfVehicle: 'new',
      AgeOfPolicyHolder: '26 to 30',
      PoliceReportFiled: 'No',
      WitnessPresent: 'No',
      AgentType: 'External',
      NumberOfSuppliments: 'more than 5',
      AddressChange_Claim: 'under 6 months',
      NumberOfCars: '1 vehicle',
      Year: 2024,
      BasePolicy: 'All Perils'
    }
  }
};

export function ClaimsOfficerDashboardPage() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Quick submission form state
  const [formData, setFormData] = useState(PRESET_SCENARIOS.genuine.data);
  const [claimIdInput, setClaimIdInput] = useState(`CLM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        api.getClaims({ page: 1, page_size: 25 }),
        api.getDashboardStats()
      ]);
      setClaims(claimsRes.claims || []);
      setStats(statsRes);
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

  const handleApplyPreset = (key) => {
    if (PRESET_SCENARIOS[key]) {
      setFormData(PRESET_SCENARIOS[key].data);
      setClaimIdInput(`CLM-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitResult(null);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await api.submitClaim(claimIdInput, formData, true);
      setSubmitResult(res);
      // Reload queue to show new claim
      loadData();
    } catch (err) {
      setSubmitResult({ error: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClaims = claims.filter(c => {
    const matchesSearch = !searchTerm || 
      c.claim_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.features?.Make?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || c.risk_category === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Claims Intake & Triage Workspace
            </h1>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '3px 8px', 
              borderRadius: '20px', 
              border: '1px solid rgba(16, 185, 129, 0.3)' 
            }}>
              Claims Officer Role
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Submit claims, score risk in real time, and triage payouts using IBM LinuxONE inference
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setClaimIdInput(`CLM-${Math.floor(1000 + Math.random() * 9000)}`);
              setSubmitResult(null);
              setShowSubmitModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
            }}
          >
            <PlusCircle size={16} />
            Submit New Claim
          </button>

          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '9px 14px',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Intake KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Claims Ingested</span>
            <FileStack size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.total_claims || claims.length || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            Live in Database
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Fast-Track Approved (Low)</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {stats?.risk_distribution?.LOW || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Eligible for expedited payout
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Average Risk Score</span>
            <TrendingUp size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4' }}>
            {stats?.average_risk_score ? `${(stats.average_risk_score * 100).toFixed(1)}%` : '38.4%'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Optimal threshold: 61.0%
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Flagged for Review</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b' }}>
            {(stats?.risk_distribution?.HIGH || 0) + (stats?.risk_distribution?.MEDIUM || 0)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Directed to SIU Queue
          </div>
        </div>
      </div>

      {/* Main Intake Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search Claim ID or Make..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setRiskFilter(tier)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: riskFilter === tier ? 'var(--primary)' : 'var(--bg-card)',
                    color: riskFilter === tier ? '#060b14' : 'var(--text-muted)'
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Claim ID</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Vehicle / Make</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Fault Category</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Risk Tier</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>AI Risk Score</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No claims match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.claim_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {claim.claim_id}
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-primary)' }}>
                      {claim.features?.Make || 'Toyota'} ({claim.features?.VehicleCategory || 'Sedan'})
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-muted)' }}>
                      {claim.features?.Fault || 'Policy Holder'}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <RiskBadge category={claim.risk_category} />
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${(claim.risk_score || 0) * 100}%`, 
                              height: '100%', 
                              background: (claim.risk_score || 0) > 0.61 ? '#ef4444' : (claim.risk_score || 0) > 0.35 ? '#f59e0b' : '#10b981' 
                            }} 
                          />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {((claim.risk_score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <StatusBadge status={claim.review_status || 'PENDING_REVIEW'} />
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Submission Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 11, 20, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Submit & Score Claim
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Execute real-time inference on the IBM LinuxONE backend
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Scenario Quick-fill */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Quick Presets
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('genuine')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Load Clean Genuine Claim
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('suspicious')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Load High-Risk Suspicious Claim
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Claim ID
                  </label>
                  <input
                    type="text"
                    value={claimIdInput}
                    onChange={(e) => setClaimIdInput(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Fault Determination
                  </label>
                  <select
                    value={formData.Fault}
                    onChange={(e) => setFormData({ ...formData, Fault: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  >
                    <option value="Policy Holder">Policy Holder</option>
                    <option value="Third Party">Third Party</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Vehicle Category
                  </label>
                  <select
                    value={formData.VehicleCategory}
                    onChange={(e) => setFormData({ ...formData, VehicleCategory: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="Sport">Sport</option>
                    <option value="Utility">Utility</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    value={formData.Make}
                    onChange={(e) => setFormData({ ...formData, Make: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Base Policy Coverage
                  </label>
                  <select
                    value={formData.BasePolicy}
                    onChange={(e) => setFormData({ ...formData, BasePolicy: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  >
                    <option value="Liability">Liability</option>
                    <option value="Collision">Collision</option>
                    <option value="All Perils">All Perils</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Driver Age
                  </label>
                  <input
                    type="number"
                    value={formData.Age}
                    onChange={(e) => setFormData({ ...formData, Age: parseInt(e.target.value) || 30 })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {submitResult && (
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: submitResult.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${submitResult.error ? '#ef4444' : '#10b981'}`,
                  marginTop: '10px'
                }}>
                  {submitResult.error ? (
                    <div style={{ color: '#ef4444', fontSize: '13px' }}>Error: {submitResult.error}</div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '14px', marginBottom: '4px' }}>
                        Prediction Generated Successfully!
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        Risk Score: <strong>{((submitResult.risk_score || 0) * 100).toFixed(1)}%</strong> | Category: <RiskBadge category={submitResult.risk_category} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: submitting ? 'wait' : 'pointer'
                  }}
                >
                  {submitting ? 'Running Inference...' : 'Calculate Risk & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedClaim && (
        <ClaimDetailsDrawer
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onClaimUpdated={(upd) => {
            setClaims(prev => prev.map(c => c.claim_id === upd.claim_id ? upd : c));
            setSelectedClaim(upd);
          }}
        />
      )}
    </div>
  );
}
