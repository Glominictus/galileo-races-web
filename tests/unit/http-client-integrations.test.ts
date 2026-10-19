import { afterEach, describe, expect, it, vi } from 'vitest';
import { GalileoRacePortalClient } from '../../src/lib/race-portal/http-client.server';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GalileoRacePortalClient integrations payload', () => {
  it('maps { data, count } responses into RacePage.items', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        count: 1,
        data: [{
          id: 'race-1',
          name: 'Trail Demo',
          thumb: '/poster.jpg',
          showPublic: true,
          isHistoric: false,
          raceConfig: {
            raceType: 'trail',
            province: 'Lugo',
            city: 'Folgoso',
            raceStartAt: '2026-12-01T08:00:00.000Z',
          },
          raceEvents: [{
            id: 'evt-1',
            name: '16K',
            distance: '16',
            defaultPrice: '26',
            maxRegistrations: 200,
            inscriptionsCount: 20,
            allowRegistrations: true,
            isPublished: true,
            inscriptionStartAt: '2026-01-01T00:00:00.000Z',
            inscriptionEndAt: '2026-11-30T23:59:00.000Z',
            startAt: '2026-12-01T08:00:00.000Z',
          }],
        }],
      }),
    })));

    const client = new GalileoRacePortalClient('http://example.test', 'key');
    const page = await client.listRaces();

    expect(page.total).toBe(1);
    expect(page.items[0]?.name).toBe('Trail Demo');
    expect(page.items[0]?.type).toBe('trail');
    expect(page.items[0]?.status).toBe('open');
    expect(Array.isArray(page.items)).toBe(true);
  });
});
