import type { RacePortalClient } from './client';
import { RacePortalError } from './client';
import { mockAccount, mockRaces, mockRegistrations } from './mock-data.server';
import type { CreateRaceOrderInput, LoginInput, RaceFilters, RegisterInput } from './types';

const ordersByKey = new Map<string, { orderId: string; total: number; paymentUrl: string }>();

export class MockRacePortalClient implements RacePortalClient {
  async listRaces(filters: RaceFilters = {}) {
    const query = filters.query?.trim().toLocaleLowerCase('es') ?? '';
    const items = mockRaces.filter((race) => {
      const matchesQuery = !query || [race.name, race.city, race.province].some((value) => value.toLocaleLowerCase('es').includes(query));
      return matchesQuery && (!filters.province || race.province === filters.province) && (!filters.type || race.type === filters.type) && (!filters.status || race.status === filters.status);
    });
    return { items, total: items.length };
  }

  async getRace(slug: string) {
    const race = mockRaces.find((item) => item.slug === slug);
    if (!race) throw new RacePortalError('Carrera no encontrada', 'RACE_NOT_FOUND', 404);
    return race;
  }

  async getAvailability(slug: string) {
    const race = await this.getRace(slug);
    return { raceId: race.id, modalities: race.modalities.map(({ id, availablePlaces, status }) => ({ id, availablePlaces, status })), checkedAt: new Date().toISOString() };
  }

  async login(input: LoginInput) {
    if (!input.email.includes('@') || input.password.length < 8) throw new RacePortalError('Revisa tu email y contraseña', 'INVALID_CREDENTIALS', 401);
    return { token: 'mock-session-token', account: { ...mockAccount, email: input.email } };
  }

  async register(input: RegisterInput) {
    if (!input.email.includes('@') || input.password.length < 8) throw new RacePortalError('La contraseña debe tener al menos 8 caracteres', 'INVALID_REGISTRATION');
    return { token: 'mock-session-token', account: { ...mockAccount, email: input.email, firstName: input.firstName, lastName: input.lastName } };
  }

  async getAccount(token: string) { this.assertToken(token); return mockAccount; }
  async getRegistrations(token: string) { this.assertToken(token); return mockRegistrations; }

  async createRaceOrder(input: CreateRaceOrderInput, token: string) {
    this.assertToken(token);
    const race = await this.getRace(input.raceSlug);
    const modality = race.modalities.find((item) => item.id === input.modalityId);
    if (!modality) throw new RacePortalError('Modalidad no encontrada', 'MODALITY_NOT_FOUND', 404);
    if (modality.status === 'sold-out') throw new RacePortalError('No quedan plazas disponibles', 'RACE_SOLD_OUT', 409);
    if (modality.status !== 'open') throw new RacePortalError('La inscripción no está abierta', 'REGISTRATION_CLOSED', 409);
    const existing = ordersByKey.get(input.idempotencyKey);
    if (existing) return { ...existing, paidState: 'pending' as const };
    const orderId = `mock-${input.idempotencyKey.slice(0, 8)}`;
    const order = { orderId, total: modality.priceFrom, paymentUrl: `/pago/retorno?order=${orderId}` };
    ordersByKey.set(input.idempotencyKey, order);
    return { ...order, paidState: 'pending' as const };
  }

  private assertToken(token: string) { if (!token) throw new RacePortalError('Inicia sesión para continuar', 'AUTH_REQUIRED', 401); }
}
