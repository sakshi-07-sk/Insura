import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getApiBaseUrl, 
  setApiBaseUrl, 
  isMockModeEnabled, 
  setMockModeEnabled, 
  api 
} from '../services/api';

describe('ClaimGuard API Client & Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to http://localhost:8000 when no environment or local override is provided', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('allows dynamic base URL configuration and removes trailing slashes', () => {
    setApiBaseUrl('http://linuxone-s390x-host:8000/');
    expect(getApiBaseUrl()).toBe('http://linuxone-s390x-host:8000');
  });

  it('controls mock mode state explicitly', () => {
    expect(isMockModeEnabled()).toBe(false);
    setMockModeEnabled(true);
    expect(isMockModeEnabled()).toBe(true);
    setMockModeEnabled(false);
    expect(isMockModeEnabled()).toBe(false);
  });

  it('serves synthetic demo records when mock mode is enabled', async () => {
    setMockModeEnabled(true);
    const health = await api.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toContain('MOCK');

    const stats = await api.getDashboardStats();
    expect(stats.total_claims).toBeGreaterThan(0);
    expect(stats.risk_category_counts).toBeDefined();

    const scoreResult = await api.scoreClaim({
      features: { Make: 'Toyota', VehiclePrice: '20000 to 29000' }
    });
    expect(scoreResult.risk_category).toBe('LOW');
    expect(scoreResult.disclaimer).toBeDefined();
  });
});
