import { describe, expect, it, vi } from 'vitest';
import type { RacePortalClient } from '../../src/lib/race-portal/client';
import { RacePortalError } from '../../src/lib/race-portal/client';
import { ResilientRacePortalClient, shouldFallbackToMock } from '../../src/lib/race-portal/index.server';
import { MockRacePortalClient } from '../../src/lib/race-portal/mock-client.server';

function createStubPrimary(overrides: Partial<RacePortalClient>): RacePortalClient {
  const notUsed = async () => {
    throw new Error('Unexpected call');
  };
  return {
    listRaces: notUsed,
    getRace: notUsed,
    getAvailability: notUsed,
    login: notUsed,
    register: notUsed,
    getAccount: notUsed,
    updateAccount: notUsed,
    getRegistrations: notUsed,
    createRaceOrder: notUsed,
    ...overrides,
  };
}

describe('ResilientRacePortalClient', () => {
  it('falls back to mock client on network failures and 5xx errors', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const primary = createStubPrimary({
      listRaces: async () => {
        throw new TypeError('fetch failed');
      },
      getAccount: async () => {
        throw new RacePortalError('Bad gateway', 'UPSTREAM_ERROR', 502);
      },
    });

    const client = new ResilientRacePortalClient(primary, new MockRacePortalClient());

    const page = await client.listRaces();
    expect(page.items.length).toBeGreaterThan(0);

    const account = await client.getAccount('demo-token');
    expect(account.dni).toBe('12345678Z');

    warnSpy.mockRestore();
  });

  it('falls back when an upstream route is not mounted yet (generic 404), but not on RACE_NOT_FOUND', async () => {
    expect(shouldFallbackToMock(new RacePortalError('Not Found', 'GALILEO_ERROR', 404))).toBe(true);
    expect(shouldFallbackToMock(new RacePortalError('Carrera no encontrada', 'RACE_NOT_FOUND', 404))).toBe(false);
    expect(shouldFallbackToMock(new RacePortalError('Modalidad no encontrada', 'MODALITY_NOT_FOUND', 404))).toBe(false);
  });

  it('rethrows 4xx business errors (401, 409, 400, RACE_NOT_FOUND) without calling fallback', async () => {
    const fallbackLogin = vi.fn();
    const fallbackRegister = vi.fn();
    const fallbackGetRace = vi.fn();

    const primary = createStubPrimary({
      login: async () => {
        throw new RacePortalError('Contraseña incorrecta', 'INVALID_CREDENTIALS', 401);
      },
      register: async () => {
        throw new RacePortalError('El DNI ya está registrado', 'DOCUMENT_ALREADY_EXISTS', 409);
      },
      getRace: async () => {
        throw new RacePortalError('Carrera no encontrada', 'RACE_NOT_FOUND', 404);
      },
    });

    const fallback = createStubPrimary({
      login: fallbackLogin,
      register: fallbackRegister,
      getRace: fallbackGetRace,
    });

    const client = new ResilientRacePortalClient(primary, fallback);

    await expect(client.login({ dni: '12345678Z', password: 'wrongpassword' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
    expect(fallbackLogin).not.toHaveBeenCalled();

    await expect(
      client.register({
        firstName: 'Iria',
        lastName: 'Varela',
        dni: '12345678Z',
        email: 'iria@pulso.gal',
        confirmEmail: 'iria@pulso.gal',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '600000000',
        birthDate: '1992-04-12',
      }),
    ).rejects.toMatchObject({
      code: 'DOCUMENT_ALREADY_EXISTS',
      status: 409,
    });
    expect(fallbackRegister).not.toHaveBeenCalled();

    await expect(client.getRace('trail-serra-do-courel-2026')).rejects.toMatchObject({
      code: 'RACE_NOT_FOUND',
      status: 404,
    });
    expect(fallbackGetRace).not.toHaveBeenCalled();
  });
});
