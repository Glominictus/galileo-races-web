import { describe, expect, it } from 'vitest';
import { isRaceOpen } from '../../src/lib/domain/races/filters';

describe('isRaceOpen barrier', () => {
  const baseNow = new Date('2026-11-05T12:00:00Z').getTime();

  it('accepts future races with open status', () => {
    expect(
      isRaceOpen(
        {
          status: 'open',
          startsAt: '2026-11-20T10:00:00Z',
        },
        baseNow
      )
    ).toBe(true);
  });

  it('rejects races with status closed, sold-out or upcoming', () => {
    expect(
      isRaceOpen(
        {
          status: 'closed',
          startsAt: '2026-11-20T10:00:00Z',
        },
        baseNow
      )
    ).toBe(false);

    expect(
      isRaceOpen(
        {
          status: 'sold-out',
          startsAt: '2026-11-20T10:00:00Z',
        },
        baseNow
      )
    ).toBe(false);

    expect(
      isRaceOpen(
        {
          status: 'upcoming',
          startsAt: '2026-11-20T10:00:00Z',
        },
        baseNow
      )
    ).toBe(false);
  });

  it('rejects past races even if status is open', () => {
    expect(
      isRaceOpen(
        {
          status: 'open',
          startsAt: '2026-08-20T10:00:00Z',
        },
        baseNow
      )
    ).toBe(false);
  });

  it('rejects races where registrationEndsAt has passed', () => {
    expect(
      isRaceOpen(
        {
          status: 'open',
          startsAt: '2026-11-20T10:00:00Z',
          registrationEndsAt: '2026-11-01T23:59:59Z',
        },
        baseNow
      )
    ).toBe(false);
  });

  it('accepts races where registrationEndsAt is still in the future', () => {
    expect(
      isRaceOpen(
        {
          status: 'open',
          startsAt: '2026-11-20T10:00:00Z',
          registrationEndsAt: '2026-11-18T23:59:59Z',
        },
        baseNow
      )
    ).toBe(true);
  });
});

