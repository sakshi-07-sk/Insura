import React, { useState } from 'react';
import { 
  Server, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Sliders 
} from 'lucide-react';
import { 
  getApiBaseUrl, 
  setApiBaseUrl, 
  isMockModeEnabled, 
  setMockModeEnabled, 
  getApiKey, 
  setApiKey, 
  getReviewerId, 
  setReviewerId, 
  api 
} from '../services/api';

export function SettingsPage() {
  const [baseUrlInput, setBaseUrlInput] = useState(getApiBaseUrl());
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [reviewerIdInput, setReviewerIdInput] = useState(getReviewerId());
  const [mockActive, setMockActive] = useState(isMockModeEnabled());

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setApiBaseUrl(baseUrlInput);
    setApiKey(apiKeyInput);
    setReviewerId(reviewerIdInput);
    setMockModeEnabled(mockActive);

    setSaveFeedback('Configuration saved successfully.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Save temporary URL for test
    setApiBaseUrl(baseUrlInput);

    try {
      const start = Date.now();
      const [health, ready] = await Promise.all([
        api.checkHealth(),
        api.checkReadiness()
      ]);
      const latency = Date.now() - start;

      setTestResult({
        success: true,
        latency,
        health,
        ready
      });
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setBaseUrlInput('http://localhost:8000');
    setApiKeyInput('');
    setReviewerIdInput('adjuster_marcus');
    setMockActive(false);

    setApiBaseUrl('');
    setApiKey('');
    setReviewerId('adjuster_marcus');
    setMockModeEnabled(false);

    setSaveFeedback('Restored system defaults.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          System Settings & Ingress Configuration
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Configure API connection endpoints, LinuxONE reverse proxy routing, and audit credentials
        </div>
      </div>

      {saveFeedback && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--risk-low-bg)', color: 'var(--risk-low-text)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{saveFeedback}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        {/* Backend API Configuration */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Server size={18} style={{ color: 'var(--primary)' }} />
              <span>Backend API Ingress Host</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="api-base-url">
              API Base URL
            </label>
            <input
              id="api-base-url"
              type="text"
              className="form-control"
              placeholder="http://localhost:8000 or /api"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Target endpoint for FastAPI. On IBM LinuxONE or behind Nginx, this can be configured to an external hostname or relative path (e.g. <code>http://linuxone-host:8000</code>).
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              <RefreshCw size={13} style={{ animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isTesting ? 'Testing Health Probe...' : 'Test API Connection'}</span>
            </button>
          </div>

          {/* Test Connection Result Box */}
          {testResult && (
            <div 
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: testResult.success ? 'var(--risk-low-bg)' : 'var(--risk-high-bg)',
                border: `1px solid ${testResult.success ? 'var(--risk-low-border)' : 'var(--risk-high-border)'}`,
                color: testResult.success ? 'var(--risk-low-text)' : 'var(--risk-high-text)',
                fontSize: '12px'
              }}
            >
              {testResult.success ? (
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} />
                    <span>Connection Established ({testResult.latency}ms roundtrip)</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', lineHeight: 1.4 }}>
                    • Service: <strong>{testResult.health?.service}</strong> (v{testResult.health?.version})<br />
                    • Database Persistence: <strong>{testResult.ready?.database_ready ? 'ONLINE (Ready)' : 'UNREACHABLE'}</strong><br />
                    • Model Artifact: <strong>{testResult.ready?.model_ready ? `LOADED (v${testResult.ready?.model_version})` : 'MISSING'}</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} />
                    <span>Failed to Reach Backend</span>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '11px' }}>
                    {testResult.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Development Mock Mode Toggle */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} style={{ color: 'var(--risk-med-accent)' }} />
              <span>Development Mock Mode</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              id="mockModeToggle"
              checked={mockActive}
              onChange={(e) => setMockActive(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="mockModeToggle" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Enable Offline Mock Mode (Development Only)
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                When enabled, the frontend serves isolated synthetic demonstration records even if Member 2's backend is unreachable. <strong>Disabled by default</strong> for integrated datathon evaluation. An explicit yellow banner will be displayed across the dashboard when mock mode is active.
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer Audit Profile & Security */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} style={{ color: 'var(--primary)' }} />
              <span>Reviewer Audit Profile & Authentication</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="reviewer-id-input">
                Default Reviewer Identity
              </label>
              <input
                id="reviewer-id-input"
                type="text"
                className="form-control"
                value={reviewerIdInput}
                onChange={(e) => setReviewerIdInput(e.target.value)}
                placeholder="e.g. adjuster_marcus"
                required
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Recorded in audit trails and review status changes (<code>X-Reviewer-Id</code>).
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="api-key-input">
                API Key (Optional Header)
              </label>
              <input
                id="api-key-input"
                type="password"
                className="form-control"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Passed as X-API-Key if required"
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Required only when backend <code>REQUIRE_AUTH=True</code> is enforced.
              </div>
            </div>
          </div>

          <div className="notice-disclaimer" style={{ marginTop: '16px' }}>
            <strong>Security Architecture Note:</strong> Client-side authentication in this prototype serves to distinguish reviewer audit logs. In production deployments, access tokens are managed via enterprise OAuth2 / SSO gateways.
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetDefaults}
          >
            <RotateCcw size={14} />
            <span>Reset to Factory Defaults</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ minWidth: '150px' }}
          >
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
