import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS, ROLES, ROLE_DETAILS } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('officer@insura.ai');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const logged = await login(email, password);
      const destination = from || ROLE_DETAILS[logged.role]?.defaultRoute || '/claims/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (account) => {
    setEmail(account.email);
    setPassword('demo1234');
    setError('');
    setLoading(true);
    try {
      const logged = await login(account.email, 'demo1234', account.role);
      const destination = from || ROLE_DETAILS[logged.role]?.defaultRoute || '/claims/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060b14',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.12) 0%, transparent 45%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px'
    }}>
      {/* Brand Header */}
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          marginBottom: '32px'
        }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
        }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            INSURA <span style={{ fontSize: '11px', color: '#06b6d4', padding: '2px 8px', background: 'rgba(6,182,212,0.15)', borderRadius: '20px', border: '1px solid rgba(6,182,212,0.3)', fontWeight: 600 }}>s390x</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.04em' }}>
            ENTERPRISE RISK INTELLIGENCE
          </div>
        </div>
      </Link>

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.1)',
          position: 'relative'
        }}
      >
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Sign in to access your role-specific risk workspace
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@insura.ai"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(2, 6, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <button 
                type="button" 
                onClick={() => alert("For this demonstration, use any demo credentials or select a quick-access role below.")}
                style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  background: 'rgba(2, 6, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              marginTop: '4px',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '28px 0 20px',
          color: '#64748b',
          fontSize: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span>OR CHOOSE A DEMO ROLE</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '10px' }}>
          {DEMO_ACCOUNTS.map((acc) => {
            const details = ROLE_DETAILS[acc.role];
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickDemo(acc)}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${details.color}40`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${details.color}15`;
                  e.currentTarget.style.borderColor = details.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = `${details.color}40`;
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: details.bg,
                  color: details.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  flexShrink: 0
                }}>
                  {acc.initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {details.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    1-Click Access
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Signup Link */}
        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          Need an account for your organization?{' '}
          <Link to="/signup" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>INSURA Platform</span>
        <span>•</span>
        <span>LinuxONE s390x Native</span>
        <span>•</span>
        <span>Zero-Knowledge Encryption</span>
      </div>
    </div>
  );
}
