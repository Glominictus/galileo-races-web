import { describe, expect, it } from 'vitest';
import { MockRacePortalClient } from '../../src/lib/race-portal/mock-client.server';

describe('MockRacePortalClient', () => {
  it('filters the catalog by query, province and type', async () => {
    const client = new MockRacePortalClient();
    const result = await client.listRaces({ query: 'trail', province: 'Lugo', type: 'trail' });
    expect(result.total).toBe(1);
    expect(result.items[0]?.slug).toBe('trail-serra-do-courel-2026');
  });

  it('returns a stable not-found domain error', async () => {
    const client = new MockRacePortalClient();
    await expect(client.getRace('missing')).rejects.toMatchObject({ code: 'RACE_NOT_FOUND', status: 404 });
  });

  it('rejects sold-out registrations', async () => {
    const client = new MockRacePortalClient();
    await expect(client.createRaceOrder({
      raceSlug: 'trail-serra-do-courel-2026', modalityId: 'ultra', idempotencyKey: 'sold-out-key',
      participant: { firstName: 'Iria', lastName: 'Varela', documentType: 'dni', document: '00000000T', birthDate: '1990-01-01', phone: '600000000' },
    }, 'token')).rejects.toMatchObject({ code: 'RACE_SOLD_OUT', status: 409 });
  });

  it('makes order creation idempotent', async () => {
    const client = new MockRacePortalClient();
    const input = { raceSlug: 'media-maraton-maceda-2026', modalityId: 'popular', idempotencyKey: 'same-request-123', participant: { firstName: 'Iria', lastName: 'Varela', documentType: 'dni' as const, document: '00000000T', birthDate: '1990-01-01', phone: '600000000' } };
    const first = await client.createRaceOrder(input, 'token');
    const second = await client.createRaceOrder(input, 'token');
    expect(second).toEqual(first);
  });

  it('requires authentication for account data', async () => {
    const client = new MockRacePortalClient();
    await expect(client.getAccount('')).rejects.toMatchObject({ code: 'AUTH_REQUIRED', status: 401 });
  });

  it('logs in using a valid DNI and password', async () => {
    const client = new MockRacePortalClient();
    const session = await client.login({ dni: '12345678z', password: 'password123' });
    expect(session.account.dni).toBe('12345678Z');
    await expect(client.login({ dni: 'invalid', password: 'password123' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  });

  it('updates account personal data', async () => {
    const client = new MockRacePortalClient();
    const session = await client.login({ dni: '12345678z', password: 'password123' });
    const updated = await client.updateAccount(
      { phone: '654321987', birthDate: '1992-05-15', club: 'Galileo Runners' },
      session.token
    );
    expect(updated.phone).toBe('654321987');
    expect(updated.birthDate).toBe('1992-05-15');
    expect(updated.club).toBe('Galileo Runners');
  });
});
