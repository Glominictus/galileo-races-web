import { describe, expect, it } from 'vitest';
import { normalizeDocument, isValidDniOrNie, documentSchema } from '../../src/lib/domain/auth/identity';

describe('Auth Identity Domain', () => {
  it('normalizes document with spaces and lowercase', () => {
    expect(normalizeDocument(' 12345678-z ')).toBe('12345678Z');
    expect(normalizeDocument('x-1234567-a')).toBe('X1234567A');
  });

  it('validates correct DNI and NIE formats', () => {
    expect(isValidDniOrNie('12345678Z')).toBe(true);
    expect(isValidDniOrNie('X1234567L')).toBe(true);
    expect(isValidDniOrNie('Y1234567B')).toBe(true);
    expect(isValidDniOrNie('Z1234567T')).toBe(true);
  });

  it('rejects invalid documents', () => {
    expect(isValidDniOrNie('1234567')).toBe(false);
    expect(isValidDniOrNie('123456789')).toBe(false);
    expect(isValidDniOrNie('A12345678')).toBe(false);
    expect(isValidDniOrNie('')).toBe(false);
  });

  it('validates with documentSchema Zod', () => {
    const valid = documentSchema.safeParse(' 12345678z ');
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toBe('12345678Z');
    }

    const invalid = documentSchema.safeParse('invalido');
    expect(invalid.success).toBe(false);
  });
});
