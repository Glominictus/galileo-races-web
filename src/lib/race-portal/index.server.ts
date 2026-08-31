import type { RacePortalClient } from './client';
import { GalileoRacePortalClient } from './http-client.server';
import { MockRacePortalClient } from './mock-client.server';

let client: RacePortalClient | undefined;

export function getRacePortalClient(): RacePortalClient {
  if (client) return client;
  const useMocks = String(import.meta.env.GALILEO_USE_MOCKS ?? 'true').toLowerCase() !== 'false';
  if (useMocks) return (client = new MockRacePortalClient());
  const baseUrl = String(import.meta.env.GALILEO_API_URL ?? '').replace(/\/$/, '');
  const apiKey = String(import.meta.env.GALILEO_RACE_PORTAL_API_KEY ?? '');
  if (!baseUrl || !apiKey) throw new Error('GALILEO_API_URL y GALILEO_RACE_PORTAL_API_KEY son obligatorias');
  return (client = new GalileoRacePortalClient(baseUrl, apiKey));
}
