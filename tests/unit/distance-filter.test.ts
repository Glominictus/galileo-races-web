import { describe, expect, it } from 'vitest';
import { parseDistances, matchesDistance } from '../../src/lib/domain/races/distances';
import { matchesQuery } from '../../src/lib/domain/races/filters';
import type { RaceSummary } from '../../src/lib/race-portal/types';

describe('Distance filter logic', () => {
  it('parses numbers from various distance labels', () => {
    expect(parseDistances('21,1 km · 10 km')).toEqual([21.1, 10]);
    expect(parseDistances('15 km · 5 km')).toEqual([15, 5]);
    expect(parseDistances('42,2 km · 21,1 km')).toEqual([42.2, 21.1]);
    expect(parseDistances('25 km · 14 km')).toEqual([25, 14]);
    expect(parseDistances('18 km')).toEqual([18]);
  });

  it('matches 5 km without false positives for 15 km or 25 km', () => {
    expect(matchesDistance('15 km · 5 km', '5')).toBe(true);
    expect(matchesDistance('15 km', '5')).toBe(false);
    expect(matchesDistance('25 km · 14 km', '5')).toBe(false);
  });

  it('matches 10 km accurately', () => {
    expect(matchesDistance('21,1 km · 10 km', '10')).toBe(true);
    expect(matchesDistance('10 km', '10')).toBe(true);
    expect(matchesDistance('15 km · 5 km', '10')).toBe(false);
  });

  it('matches 15 km accurately', () => {
    expect(matchesDistance('15 km · 5 km', '15')).toBe(true);
    expect(matchesDistance('15 km', '15')).toBe(true);
    expect(matchesDistance('21,1 km · 10 km', '15')).toBe(false);
  });

  it('matches 21 km with 21.1 km half marathon', () => {
    expect(matchesDistance('21,1 km · 10 km', '21')).toBe(true);
    expect(matchesDistance('42,2 km · 21,1 km', '21')).toBe(true);
    expect(matchesDistance('15 km · 5 km', '21')).toBe(false);
  });

  it('matches 42 km with 42.2 km marathon', () => {
    expect(matchesDistance('42,2 km · 21,1 km', '42')).toBe(true);
    expect(matchesDistance('21,1 km · 10 km', '42')).toBe(false);
  });

  it('supports query search by distance term like 10k or 21k', () => {
    const race: RaceSummary = {
      id: 'race-test',
      slug: 'race-test',
      name: 'Media Maratón Test',
      city: 'Ourense',
      province: 'Ourense',
      distanceLabel: '21,1 km · 10 km',
      type: 'asfalto',
      startsAt: '2026-09-27T09:30:00+02:00',
      priceFrom: 14,
      imageUrl: '/images/test.png',
      status: 'open',
    };

    expect(matchesQuery(race, '10k')).toBe(true);
    expect(matchesQuery(race, '21k')).toBe(true);
    expect(matchesQuery(race, '5k')).toBe(false);
    expect(matchesQuery(race, '10 km')).toBe(true);
  });
});
