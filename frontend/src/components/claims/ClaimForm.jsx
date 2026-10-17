import React, { useState } from 'react';
import { 
  Send, 
  RotateCcw, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { 
  FEATURE_GROUPS, 
  FEATURE_DEFINITIONS, 
  getDefaultFormFeatures 
} from '../../data/featureSchema';
import { CLAIM_PRESETS } from '../../data/claimPresets';
import { api } from '../../services/api';

export function ClaimForm({ onScored, onError }) {
  const [formData, setFormData] = useState(getDefaultFormFeatures());
  const [claimId, setClaimId] = useState('');
  const [notes, setNotes] = useState('');
  const [persistToDb, setPersistToDb] = useState(true);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activePresetId, setActivePresetId] = useState(null);

  // Field change handler
  const handleFeatureChange = (name, val) => {
    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
    // Clear validation error for field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Load a demo preset
  const handleLoadPreset = (preset) => {
    setActivePresetId(preset.id);
    setFormData(preset.features);
    setClaimId(preset.claimId);
    setNotes(preset.notes);
    setValidationErrors({});
  };

  // Reset form
  const handleReset = () => {
    setFormData(getDefaultFormFeatures());
    setClaimId('');
    setNotes('');
    setActivePresetId(null);
    setValidationErrors({});
  };

  // Client-side validation before submission
  const validateForm = () => {
    const errors = {};

    for (const [key, def] of Object.entries(FEATURE_DEFINITIONS)) {
      const val = formData[key];
      if (val === undefined || val === null || val === '') {
        errors[key] = `${def.label} is required.`;
      } else if (def.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          errors[key] = `${def.label} must be a valid number.`;
        } else {
          if (def.min !== undefined && num < def.min) {
            errors[key] = `${def.label} must be at least ${def.min}.`;
          }
          if (def.max !== undefined && num > def.max) {
            errors[key] = `${def.label} must be at most ${def.max}.`;
          }
        }
      }
    }

    return errors;
  };

  // Submit form to POST /claims/score
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Jump to the group that has the first error
      const firstErrorKey = Object.keys(errors)[0];
      const targetGroupIdx = FEATURE_GROUPS.findIndex(g => g.features.includes(firstErrorKey));
      if (targetGroupIdx !== -1) {
        setActiveGroupIndex(targetGroupIdx);
      }
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Coerce numeric features to appropriate number types
      const cleanFeatures = { ...formData };
      for (const [key, def] of Object.entries(FEATURE_DEFINITIONS)) {
        if (def.type === 'number') {
          cleanFeatures[key] = Number(cleanFeatures[key]);
        }
      }

      const response = await api.scoreClaim({
        claim_id: claimId.trim() || undefined,
        features: cleanFeatures,
        notes: notes.trim() || undefined,
        persist: persistToDb
      });

      if (onScored) {
        onScored(response);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        alert(`Scoring Failed: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGroup = FEATURE_GROUPS[activeGroupIndex];

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Demo Preset Bar */}
      <div 
        className="card"
        style={{
          marginBottom: '20px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-light)',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              Load Synthetic Demo Claim Preset
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              (Click to auto-populate all 28 features for demonstration)
            </span>
          </div>

          {activePresetId && (
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={handleReset}
            >
              <RotateCcw size={12} />
              <span>Clear Preset</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {CLAIM_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-subtle)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {preset.title.split('(')[0]}
                  </span>
                  <span className={`badge ${preset.badgeClass}`} style={{ fontSize: '10px' }}>
                    {preset.badgeText.replace('Expected: ', '')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Claim Submission Form */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Claim Metadata Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              Claim Identifier (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CLM-2026-9041 (Auto-generated if blank)"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              Submission / Adjuster Notes (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Initial triage remarks or channel note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
            <input
              type="checkbox"
              id="persistToDb"
              checked={persistToDb}
              onChange={(e) => setPersistToDb(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="persistToDb" style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              Persist scored claim to database
            </label>
          </div>
        </div>

        {/* Feature Group Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '2px' }}>
          {FEATURE_GROUPS.map((group, idx) => {
            const isActive = activeGroupIndex === idx;
            // Check if group has any validation error
            const hasGroupError = group.features.some(f => validationErrors[f]);

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupIndex(idx)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  color: hasGroupError ? 'var(--risk-high-accent)' : isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{group.title}</span>
                {hasGroupError && (
                  <AlertCircle size={13} style={{ color: 'var(--risk-high-accent)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Group Description */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeGroup.description}
          </p>
        </div>

        {/* Feature Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {activeGroup.features.map((key) => {
            const def = FEATURE_DEFINITIONS[key];
            if (!def) return null;
            const hasError = !!validationErrors[key];
            const currentValue = formData[key] !== undefined ? formData[key] : '';

            return (
              <div key={key} className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor={`input-${key}`}>
                  <span>{def.label}</span>
                  {def.required && <span className="required-indicator">*</span>}
                </label>

                {def.type === 'select' ? (
                  <select
                    id={`input-${key}`}
                    className={`form-control ${hasError ? 'has-error' : ''}`}
                    value={currentValue}
                    onChange={(e) => handleFeatureChange(key, e.target.value)}
                  >
                    {def.options.map((opt) => (
                      <option key={String(opt)} value={opt}>
                        {String(opt)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`input-${key}`}
                    type="number"
                    min={def.min}
                    max={def.max}
                    step={def.step || 1}
                    className={`form-control ${hasError ? 'has-error' : ''}`}
                    value={currentValue}
                    onChange={(e) => handleFeatureChange(key, e.target.value)}
                  />
                )}

                {hasError && (
                  <div className="form-error">{validationErrors[key]}</div>
                )}
                {def.description && !hasError && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {def.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeGroupIndex > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveGroupIndex(activeGroupIndex - 1)}
              >
                Previous Section
              </button>
            )}
            {activeGroupIndex < FEATURE_GROUPS.length - 1 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveGroupIndex(activeGroupIndex + 1)}
              >
                Next Section
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw size={14} />
              <span>Reset Values</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '170px' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Evaluating Risk...' : 'Score Claim in Real-Time'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
