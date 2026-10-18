import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  TrendingUp, 
  Users, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Sparkles,
  Server,
  Layers,
  Activity,
  FileCheck2,
  Menu,
  X
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(0);

  // Interactive Live Simulator Presets
  const demoPresets = [
    {
      title: "Genuine Commuter Incident",
      vehicle: "2024 Honda Civic",
      category: "Sedan",
      fault: "Third Party",
      deductible: "$500",
      pastClaims: "None",
      driverRating: "1 (Low Risk)",
      score: 14.2,
      probability: "0.142",
      tier: "LOW",
      action: "Fast-Track Payout Approved",
      color: "#10b981",
      badgeClass: "badge-low"
    },
    {
      title: "Commercial Multi-Car Impact",
      vehicle: "2023 Ford Transit",
      category: "Commercial",
      fault: "Policy Holder",
      deductible: "$400",
      pastClaims: "1 claim",
      driverRating: "2 (Moderate)",
      score: 55.8,
      probability: "0.558",
      tier: "MEDIUM",
      action: "Standard Human Review Queued",
      color: "#f59e0b",
      badgeClass: "badge-med"
    },
    {
      title: "Suspicious High-Value Sport",
      vehicle: "2024 Porsche 911",
      category: "Sport Luxury",
      fault: "Policy Holder",
      deductible: "$400",
      pastClaims: "3 to 4",
      driverRating: "4 (High)",
      score: 87.6,
      probability: "0.876",
      tier: "HIGH",
      action: "Priority SIU Investigation Flagged",
      color: "#ef4444",
      badgeClass: "badge-high"
    }
  ];

  const currentPreset = demoPresets[activePreset];

  const handleEnterApp = (role = ROLES.CLAIMS_OFFICER) => {
    switchRole(role);
    if (role === ROLES.ADMIN) navigate('/admin/dashboard');
    else if (role === ROLES.INVESTIGATOR) navigate('/investigator/dashboard');
    else if (role === ROLES.ANALYST) navigate('/analyst/dashboard');
    else navigate('/claims/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #0d1b38 0%, #060b14 70%)', color: '#f8fafc' }}>
      
      {/* 1. TOP NAVIGATION */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(6, 11, 20, 0.85)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
            }}>
              <ShieldCheck size={24} color="#060b14" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: '#f8fafc', lineHeight: 1 }}>
                INSURA<span style={{ color: '#00f2fe' }}>.AI</span>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em', marginTop: '2px' }}>
                IBM Z RISK INTELLIGENCE
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            <a href="#features" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
            <a href="#simulator" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Live Simulator</a>
            <a href="#how-it-works" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Workflow</a>
            <a href="#roles" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Workspaces</a>
            <a href="#technology" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>LinuxONE s390x</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/login"
              style={{
                padding: '8px 16px',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                textDecoration: 'none',
                background: 'rgba(15, 27, 54, 0.6)',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </Link>
            <button
              onClick={() => handleEnterApp(ROLES.CLAIMS_OFFICER)}
              style={{
                padding: '8px 18px',
                background: 'linear-gradient(135deg, #00f2fe, #0284c7)',
                color: '#060b14',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                cursor: 'pointer',
              }}
            >
              Explore Platform <ArrowRight size={15} />
            </button>
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: '#f8fafc' }}
              className="mobile-burger"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div style={{ padding: '16px 0', borderTop: '1px solid rgba(56, 189, 248, 0.1)', marginTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', textDecoration: 'none' }}>Features</a>
              <a href="#simulator" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', textDecoration: 'none' }}>Live Simulator</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', textDecoration: 'none' }}>Workflow</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', textDecoration: 'none' }}>Workspaces</a>
              <a href="#technology" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', textDecoration: 'none' }}>LinuxONE s390x</a>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 60px', position: 'relative' }}>
        
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }} className="hero-grid">
          
          {/* Left Column: Headlines & CTAs */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '24px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', display: 'inline-block', boxShadow: '0 0 10px #00f2fe' }} />
              Enterprise AI • Live on LinuxONE (`s390x`)
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}>
              Every Claim.<br />
              <span style={{
                background: 'linear-gradient(90deg, #00f2fe, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                A Smarter Decision.
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#94a3b8',
              maxWidth: '560px',
              marginBottom: '36px',
            }}>
              Insura uses AI-powered risk scoring to help insurance teams identify suspicious claim patterns, prioritize investigations, and deliver faster service to genuine customers.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '44px' }}>
              <button
                onClick={() => handleEnterApp(ROLES.CLAIMS_OFFICER)}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
                  color: '#060b14',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.45)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Launch Claims Workspace <ArrowRight size={18} />
              </button>

              <a
                href="#simulator"
                style={{
                  padding: '14px 24px',
                  background: 'rgba(15, 27, 54, 0.75)',
                  color: '#f8fafc',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={16} color="#00f2fe" />
                Try Live Simulator
              </a>
            </div>

            {/* Micro Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(56, 189, 248, 0.12)' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00f2fe' }}>83.4%</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>ROC-AUC Metric</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>51.5%</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Fraud Recall @ Test</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>&lt; 30ms</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>s390x Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Emblem & Floating Dashboard Visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* Outer Orbit Ring */}
            <div className="animate-orbit" style={{
              position: 'absolute',
              width: '460px',
              height: '460px',
              borderRadius: '50%',
              border: '1px dashed rgba(6, 182, 212, 0.25)',
              pointerEvents: 'none',
            }} />

            {/* Inner Pulsing Ring */}
            <div className="animate-pulse-glow" style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.15)',
              boxShadow: '0 0 50px rgba(6, 182, 212, 0.2)',
              pointerEvents: 'none',
            }} />

            {/* 3D Glass Emblem Container */}
            <div className="preserve-3d" style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.3)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: '#070f20',
              position: 'relative',
            }}>
              <img
                src="/images/glass_shield.jpg"
                alt="3D Glass Insurance Shield Emblem"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />

              {/* Translucent Overlay Badges */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(7, 15, 32, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    LinuxONE Active Container
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    RandomForest s390x Engine
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  READY • 200 OK
                </div>
              </div>
            </div>

            {/* Floating Top Card */}
            <div className="animate-float" style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              background: 'rgba(11, 22, 44, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '12px 18px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Claim #CLM-9402</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>Fast-Track Payout (Score: 14.2)</div>
              </div>
            </div>

            {/* Floating Bottom-Right Card */}
            <div className="animate-float-reverse" style={{
              position: 'absolute',
              bottom: '40px',
              right: '-25px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '12px 18px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Suspicious Pattern</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>Priority Review (Score: 87.6)</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE RISK SIMULATOR SECTION */}
      <section id="simulator" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Interactive Model Demonstration
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Test the AI Risk Engine in Real Time
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '640px', margin: '10px auto 0' }}>
            Simulate how Member 1's fitted pipeline and threshold policy evaluate distinct insurance incidents.
          </p>
        </div>

        {/* Preset Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {demoPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setActivePreset(index)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: activePreset === index ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 27, 54, 0.6)',
                border: activePreset === index ? '1px solid #06b6d4' : '1px solid rgba(56, 189, 248, 0.15)',
                color: activePreset === index ? '#00f2fe' : '#94a3b8',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: preset.color }} />
              {preset.title}
            </button>
          ))}
        </div>

        {/* Interactive Result Card */}
        <div className="glass-panel-glow" style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center' }} className="sim-grid">
            
            {/* Left: Input Feature Summary */}
            <div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Incident Profile</div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginBottom: '18px' }}>
                {currentPreset.title}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ background: 'rgba(6, 11, 20, 0.5)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Insured Vehicle</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>{currentPreset.vehicle}</div>
                </div>
                <div style={{ background: 'rgba(6, 11, 20, 0.5)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Fault Determination</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>{currentPreset.fault}</div>
                </div>
                <div style={{ background: 'rgba(6, 11, 20, 0.5)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Policy Deductible</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>{currentPreset.deductible}</div>
                </div>
                <div style={{ background: 'rgba(6, 11, 20, 0.5)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Historical Claims</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>{currentPreset.pastClaims}</div>
                </div>
              </div>
            </div>

            {/* Right: Risk Gauge & Model Decision */}
            <div style={{
              background: 'rgba(6, 11, 20, 0.7)',
              border: `1px solid ${currentPreset.color}40`,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: `0 0 30px ${currentPreset.color}20`,
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Risk Score
              </div>

              <div style={{ fontSize: '48px', fontWeight: 900, color: currentPreset.color, margin: '8px 0', lineHeight: 1 }}>
                {currentPreset.score}
                <span style={{ fontSize: '20px', color: '#64748b' }}>/100</span>
              </div>

              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', background: `${currentPreset.color}20`, color: currentPreset.color, fontWeight: 700, fontSize: '12px', marginBottom: '14px' }}>
                {currentPreset.tier} RISK TIER
              </div>

              <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500, padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                {currentPreset.action}
              </div>

              <button
                onClick={() => handleEnterApp(ROLES.CLAIMS_OFFICER)}
                style={{
                  marginTop: '18px',
                  width: '100%',
                  padding: '10px',
                  background: 'var(--primary)',
                  color: '#060b14',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Submit Custom Claim →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SIX CORE PLATFORM CAPABILITIES */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Enterprise Features
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Built for High-Throughput Insurance Operations
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '28px', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Zap size={22} color="#00f2fe" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              1. Real-Time Risk Scoring
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Instant model evaluation producing calibrated 0–100 risk scores within 30ms on IBM LinuxONE mainframe architecture.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Search size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              2. AI-Powered Fraud Risk Analysis
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Identifies non-obvious multi-factor correlations across 28 validated incident, policy, and demographic features.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Layers size={22} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              3. Intelligent Investigation Queue
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Triages flagged claims automatically into prioritized work queues, allowing SIU investigators to focus on high-yield cases.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <TrendingUp size={22} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              4. Explainable Risk Insights
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Translates mathematical feature importance and tree weightings into clear, transparent driver explanations for adjusters.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Activity size={22} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              5. Claims Monitoring Dashboard
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Executive oversight into claim volumes, payout rates, risk category distributions, and real-time database persistence.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Users size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              6. Human-in-the-Loop Review
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
              Strict governance ensures AI scores serve as decision support—never automatically denying genuine customer payouts.
            </p>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS WORKFLOW */}
      <section id="how-it-works" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Automated Lifecycle
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Four Steps From Incident to Decision
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(6, 182, 212, 0.25)', marginBottom: '8px' }}>01</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Submit Claim</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Intake officer inputs incident attributes, accident circumstances, vehicle specs, and policy details.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(56, 189, 248, 0.25)', marginBottom: '8px' }}>02</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Feature Validation</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              FastAPI engine validates exact schema boundaries and sends sanitized numerical/categorical tensors to the ML core.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(139, 92, 246, 0.25)', marginBottom: '8px' }}>03</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Generate Risk Score</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              The calibrated model pipeline computes risk score (0-100) and categorizes claim into LOW, MEDIUM, or HIGH.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(16, 185, 129, 0.25)', marginBottom: '8px' }}>04</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Human Decision</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Low-risk claims receive expedited payouts; high-risk claims route to investigators with decision audit trails.
            </p>
          </div>

        </div>
      </section>

      {/* 6. FOUR DEDICATED WORKSPACES */}
      <section id="roles" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Role-Based Workspaces
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Tailored Experiences for Every Team Member
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Admin */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#00f2fe', fontSize: '16px' }}>Administrator</div>
              <Server size={18} color="#00f2fe" />
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              System telemetry, user provisioning, model deployment health, audit logs, and container monitoring.
            </p>
            <button
              onClick={() => handleEnterApp(ROLES.ADMIN)}
              style={{
                width: '100%',
                padding: '9px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#38bdf8',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Enter Admin Portal →
            </button>
          </div>

          {/* Claims Officer */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '16px' }}>Claims Officer</div>
              <FileCheck2 size={18} color="#10b981" />
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              Claim submission intake, real-time risk scoring, rapid settlement qualification, and status lookup.
            </p>
            <button
              onClick={() => handleEnterApp(ROLES.CLAIMS_OFFICER)}
              style={{
                width: '100%',
                padding: '9px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Enter Claims Intake →
            </button>
          </div>

          {/* Investigator */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '16px' }}>Fraud Investigator</div>
              <Search size={18} color="#ef4444" />
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              Priority investigation queues, high-risk flags, evidence notes, and verified review outcome logging.
            </p>
            <button
              onClick={() => handleEnterApp(ROLES.INVESTIGATOR)}
              style={{
                width: '100%',
                padding: '9px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Enter SIU Queue →
            </button>
          </div>

          {/* Analyst */}
          <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#c084fc', fontSize: '16px' }}>Risk Analyst</div>
              <TrendingUp size={18} color="#8b5cf6" />
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              Model performance curves, PR-AUC analysis, confusion matrices, and feature importance telemetry.
            </p>
            <button
              onClick={() => handleEnterApp(ROLES.ANALYST)}
              style={{
                width: '100%',
                padding: '9px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#c084fc',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Enter Model Insights →
            </button>
          </div>

        </div>
      </section>

      {/* 7. TECHNOLOGY STACK & LINUXONE */}
      <section id="technology" style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div className="glass-panel" style={{ padding: '40px', background: 'rgba(7, 15, 32, 0.75)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="tech-grid">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Underlying Infrastructure
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Engineered for IBM LinuxONE (`s390x`)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                Deployed on Red Hat Enterprise Linux 9 and Ubuntu 24.04 on the IBM LinuxONE Community Cloud. Containers run rootlessly with persistent SQLite storage and zero source-compilation overhead.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu size={18} color="#00f2fe" />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>IBM Z Mainframe s390x</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Server size={18} color="#38bdf8" />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>FastAPI + Uvicorn ASGI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={18} color="#10b981" />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Scikit-Learn 1.4 Pipeline</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={18} color="#fbbf24" />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Persistent Claims Storage</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(6, 11, 20, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Verified LinuxONE Deployment Telemetry
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Target Architecture</span>
                  <span style={{ color: '#00f2fe', fontWeight: 600 }}>s390x (Big-Endian 64-bit)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Container Runtime</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>Podman 5.8 (Rootless)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Web Ingress</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>Nginx SPA Reverse Proxy (Port 8080)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Model Artifact</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>risk_model.joblib (1.9 MB Fitted)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Liveness & Readiness Probes</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>HTTP 200 OK Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. RESPONSIBLE AI & ETHICS NOTICE */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px 60px' }}>
        <div className="notice-disclaimer">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Lock size={20} color="#00f2fe" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>Responsible AI & Ethical Governance Disclosure:</strong>
              Risk scores and fraud probabilities are statistical indicators generated by machine learning models to prioritize human review. They do not constitute legal proof of fraud, and claims must never be automatically denied solely on the basis of a model score. All sensitive demographic proxies (Sex, Marital Status) have been explicitly excluded from feature training.
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(56, 189, 248, 0.12)', padding: '40px 24px', backgroundColor: 'rgba(6, 11, 20, 0.95)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              INSURA<span style={{ color: '#00f2fe' }}>.AI</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Real-Time Insurance Claim Risk Scoring & Fraud Intelligence
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#94a3b8' }}>
            <Link to="/claims/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Claims Workspace</Link>
            <Link to="/investigator/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>SIU Queue</Link>
            <Link to="/analyst/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Model Telemetry</Link>
            <Link to="/admin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Admin Center</Link>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            © 2026 Team Insura. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
