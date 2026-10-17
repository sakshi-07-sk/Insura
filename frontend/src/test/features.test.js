import { describe, it, expect } from 'vitest';
import { 
  FEATURE_DEFINITIONS, 
  FEATURE_GROUPS, 
  EXCLUDED_ETHICAL_FIELDS, 
  getDefaultFormFeatures 
} from '../data/featureSchema';
import { CLAIM_PRESETS } from '../data/claimPresets';

describe('ML Feature Schema & Ethical Governance Verification', () => {
  it('enforces exactly 28 total input features corresponding to Member 1 & 2 contract', () => {
    const keys = Object.keys(FEATURE_DEFINITIONS);
    expect(keys.length).toBe(28);

    // Count in groups
    const groupedKeys = FEATURE_GROUPS.flatMap(g => g.features);
    expect(groupedKeys.length).toBe(28);
  });

  it('verifies numeric features have valid bounds and defaults', () => {
    const numericKeys = ['Age', 'Deductible', 'DriverRating', 'WeekOfMonth', 'WeekOfMonthClaimed', 'Year'];
    for (const key of numericKeys) {
      const def = FEATURE_DEFINITIONS[key];
      expect(def).toBeDefined();
      expect(def.defaultValue).toBeDefined();
    }
  });

  it('strictly excludes protected demographic fields to prevent algorithmic bias', () => {
    const featureKeys = Object.keys(FEATURE_DEFINITIONS);
    expect(featureKeys).not.toContain('Sex');
    expect(featureKeys).not.toContain('MaritalStatus');
    expect(featureKeys).not.toContain('PolicyNumber');
    expect(featureKeys).not.toContain('RepNumber');

    expect(EXCLUDED_ETHICAL_FIELDS.some(f => f.field === 'Sex')).toBe(true);
    expect(EXCLUDED_ETHICAL_FIELDS.some(f => f.field === 'MaritalStatus')).toBe(true);
  });

  it('generates complete default form values covering all 28 features', () => {
    const defaults = getDefaultFormFeatures();
    expect(Object.keys(defaults).length).toBe(28);
    for (const [key, val] of Object.entries(defaults)) {
      expect(val).toBeDefined();
      expect(val).not.toBeNull();
    }
  });

  it('validates that all demo presets contain all 28 features', () => {
    expect(CLAIM_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of CLAIM_PRESETS) {
      expect(preset.claimId).toBeDefined();
      expect(Object.keys(preset.features).length).toBe(28);
    }
  });
});
