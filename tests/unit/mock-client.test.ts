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
});
