import type { RacePortalClient } from './client';
import { GalileoRacePortalClient } from './http-client.server';
import { MockRacePortalClient } from './mock-client.server';

function getEnv(key: string): string | undefined {
  return (import.meta.env as any)[key] ?? process.env[key];
}

export function getRacePortalClient(): RacePortalClient {
  const useMocks = String(getEnv('GALILEO_USE_MOCKS') ?? 'true').toLowerCase() !== 'false';
  if (useMocks) return new MockRacePortalClient();
  const baseUrl = String(getEnv('GALILEO_API_URL') ?? '').replace(/\/$/, '');
  const apiKey = String(getEnv('GALILEO_RACE_PORTAL_API_KEY') ?? '');
  if (!baseUrl || !apiKey) throw new Error('GALILEO_API_URL y GALILEO_RACE_PORTAL_API_KEY son obligatorias');
  return new GalileoRacePortalClient(baseUrl, apiKey);
}
