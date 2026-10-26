import type { RacePortalClient } from './client';
import { RacePortalError } from './client';
import { mockAccount, mockRaces, mockRegistrations } from './mock-data.server';
import type { CreateRaceOrderInput, LoginInput, PortalAccount, RaceFilters, RegisterInput, Registration } from './types';

const ordersByKey = new Map<string, { orderId: string; total: number; paymentUrl: string }>();
const accountsByDni = new Map<string, PortalAccount>([[mockAccount.dni.toUpperCase(), mockAccount]]);
const sessionsByToken = new Map<string, PortalAccount>();
const registrationsByToken = new Map<string, Registration[]>();

const dniRegex = /^([XYZ]\d{7}|\d{8})[A-Z]$/;

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
    const normalizedDni = input.dni.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!dniRegex.test(normalizedDni) || input.password.length < 8) {
      throw new RacePortalError('Revisa tu DNI/NIE y contraseña (mínimo 8 caracteres)', 'INVALID_CREDENTIALS', 401);
    }
    const existing = accountsByDni.get(normalizedDni);
    if (!existing) {
      throw new RacePortalError(
        'DNI no registrado.',
        'INVALID_CREDENTIALS',
        401
      );
    }
    const token = `mock-session-${normalizedDni}`;
    sessionsByToken.set(token, existing);
    return { token, account: existing };
  }

  async register(input: RegisterInput) {
    const normalizedDni = input.dni.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!dniRegex.test(normalizedDni) || !input.email.includes('@') || input.password.length < 8) {
      throw new RacePortalError('Revisa los datos del registro y asegúrate de que la contraseña tenga al menos 8 caracteres', 'INVALID_REGISTRATION', 400);
    }
    const account: PortalAccount = {
      id: `account-${Date.now()}`,
      dni: normalizedDni,
      email: input.email.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      emailVerified: true,
    };
    accountsByDni.set(normalizedDni, account);
    const token = `mock-session-${normalizedDni}`;
    sessionsByToken.set(token, account);
    return { token, account };
  }

  async getAccount(token: string) {
    this.assertToken(token);
    return sessionsByToken.get(token) ?? mockAccount;
  }

  async getRegistrations(token: string) {
    this.assertToken(token);
    return registrationsByToken.get(token) ?? mockRegistrations;
  }

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

    const currentList = registrationsByToken.get(token) ?? [...mockRegistrations];
    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      raceSlug: race.slug,
      raceName: race.name,
      eventName: `${modality.name} · ${modality.distanceKm.toLocaleString('es-ES')} km`,
      startsAt: modality.startAt || race.startsAt,
      location: `${race.city}, ${race.province}`,
      participantName: `${input.participant.firstName} ${input.participant.lastName}`.trim(),
      bibNumber: Math.floor(Math.random() * 400) + 100,
      paidState: 'paid',
      total: modality.priceFrom,
      imageUrl: race.imageUrl,
    };
    registrationsByToken.set(token, [newRegistration, ...currentList]);

    return { ...order, paidState: 'pending' as const };
  }

  private assertToken(token: string) { if (!token) throw new RacePortalError('Inicia sesión para continuar', 'AUTH_REQUIRED', 401); }
}
