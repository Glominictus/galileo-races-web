import { describe, expect, it } from 'vitest';
import {
  mapIntegrationsRaceToSummary,
  normalizeRacePagePayload,
  slugifyRace,
} from '../../src/lib/race-portal/map-integrations-race.server';

describe('map-integrations-race', () => {
  it('normalizes integrations { data, count } into a race page shape', () => {
    expect(normalizeRacePagePayload({ data: [{ id: '1' }], count: 1 })).toEqual({
      items: [{ id: '1' }],
      total: 1,
    });
    expect(normalizeRacePagePayload({ items: [{ id: '1' }], total: 1 })).toEqual({
      items: [{ id: '1' }],
      total: 1,
    });
    expect(normalizeRacePagePayload({})).toBeNull();
  });

  it('maps an integrations race into the portal summary contract', () => {
    const summary = mapIntegrationsRaceToSummary({
      id: 'a0e85536-19f5-46e4-9cea-0367c8b537fc',
      name: 'Media Maratón Demo',
      thumb: 'https://example.com/poster.jpg',
      showPublic: true,
      isHistoric: false,
      installation: { id: 'inst-1', name: 'Concello Demo' },
      raceConfig: {
        organizerName: 'Concello Demo',
        raceType: 'road_running',
        province: 'Ourense',
        city: 'Ourense',
        raceStartAt: '2026-11-27T11:00:00.000Z',
        startLocationLat: '42.33',
        startLocationLng: '-7.86',
      },
      raceEvents: [
        {
          id: 'evt-1',
          name: '21K',
          distance: '21.1',
          defaultPrice: '22',
          maxRegistrations: 100,
          inscriptionsCount: 10,
          allowRegistrations: true,
          isPublished: true,
          inscriptionStartAt: '2026-01-01T00:00:00.000Z',
          inscriptionEndAt: '2026-11-20T23:59:00.000Z',
          startAt: '2026-11-27T11:00:00.000Z',
        },
      ],
    }, new Date('2026-06-01T12:00:00.000Z'));

    expect(summary.slug).toBe(slugifyRace('Media Maratón Demo', 'a0e85536-19f5-46e4-9cea-0367c8b537fc'));
    expect(summary.type).toBe('asfalto');
    expect(summary.status).toBe('open');
    expect(summary.distanceLabel).toBe('21,1 km');
    expect(summary.priceFrom).toBe(22);
    expect(summary.latitude).toBeCloseTo(42.33);
    expect(summary.featured).toBe(true);
  });
});
