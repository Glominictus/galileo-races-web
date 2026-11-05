import { describe, it, expect } from 'vitest';
import { calculateCountdown } from '@/lib/countdown';

describe('calculateCountdown', () => {
  it('returns null for null, undefined or empty string', () => {
    expect(calculateCountdown(null)).toBeNull();
    expect(calculateCountdown(undefined)).toBeNull();
    expect(calculateCountdown('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(calculateCountdown('invalid-date')).toBeNull();
  });

  it('marks as expired when target time is in the past', () => {
    const now = 1000000;
    const past = now - 5000;
    const res = calculateCountdown(past, now);

    expect(res).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    });
  });

  it('accurately calculates days, hours, minutes and seconds for future dates', () => {
    const now = new Date('2026-01-01T00:00:00Z').getTime();
    // 2 days, 3 hours, 4 minutes, 5 seconds later
    const future = now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000;

    const res = calculateCountdown(future, now);

    expect(res).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      isExpired: false,
    });
  });
});

