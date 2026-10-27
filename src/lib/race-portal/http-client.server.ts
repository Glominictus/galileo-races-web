import { z } from 'zod';
import type { RacePortalClient } from './client';
import { RacePortalError } from './client';
import {
  filterRaceSummaries,
  mapIntegrationsRaceToDetail,
  mapIntegrationsRaceToSummary,
  normalizeRacePagePayload,
  slugifyRace,
  type IntegrationsRace,
} from './map-integrations-race.server';
import type { CreateRaceOrderInput, LoginInput, PortalAccount, PortalSession, RaceAvailability, RaceDetail, RaceFilters, RaceOrderResult, RacePage, RegisterInput, Registration, RaceSummary, UpdateAccountInput } from './types';

const unknownObject = z.object({}).loose();

function isPortalSummary(value: unknown): value is RaceSummary {
  return Boolean(
    value
    && typeof value === 'object'
    && 'slug' in value
    && 'startsAt' in value
    && 'imageUrl' in value
    && 'distanceLabel' in value,
  );
}

function isPortalDetail(value: unknown): value is RaceDetail {
  return isPortalSummary(value) && 'modalities' in value && Array.isArray((value as RaceDetail).modalities);
}

export class GalileoRacePortalClient implements RacePortalClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async listRaces(filters: RaceFilters = {}): Promise<RacePage> {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && query.set(key, value));
    const payload = await this.request<unknown>(`/races?${query}`);
    const page = normalizeRacePagePayload(payload);
    if (!page) return { items: [], total: 0 };

    const mapped = page.items.map((item) => (
      isPortalSummary(item) ? item : mapIntegrationsRaceToSummary(item as IntegrationsRace)
    ));

    // Integrations may ignore query params; always filter client-side for a stable contract.
    const items = filterRaceSummaries(mapped, filters);
    return { items, total: items.length };
  }

  async getRace(slug: string): Promise<RaceDetail> {
    try {
      const payload = await this.request<unknown>(`/races/${encodeURIComponent(slug)}`);
      if (isPortalDetail(payload)) return payload;
      if (payload && typeof payload === 'object') return mapIntegrationsRaceToDetail(payload as IntegrationsRace);
    } catch (error) {
      if (!(error instanceof RacePortalError) || error.status !== 404) throw error;
    }

    const payload = await this.request<unknown>('/races');
    const page = normalizeRacePagePayload(payload);
    const raw = page?.items.find((item) => matchesRaceLookup(item, slug));
    if (!raw) throw new RacePortalError('Carrera no encontrada', 'RACE_NOT_FOUND', 404);
    if (isPortalDetail(raw)) return raw;
    return mapIntegrationsRaceToDetail(raw as IntegrationsRace);
  }

  getAvailability(slug: string) {
    return this.getRace(slug).then((race): RaceAvailability => ({
      raceId: race.id,
      modalities: race.modalities.map(({ id, availablePlaces, status }) => ({ id, availablePlaces, status })),
      checkedAt: new Date().toISOString(),
    }));
  }

  login(input: LoginInput) { return this.request<PortalSession>('/auth/login', this.jsonPost(input)); }
  register(input: RegisterInput) { return this.request<PortalSession>('/auth/register', this.jsonPost(input)); }
  getAccount(token: string) { return this.request<PortalAccount>('/account', { headers: this.headers(token) }); }
  updateAccount(input: UpdateAccountInput, token: string) { return this.request<PortalAccount>('/account', { method: 'PATCH', headers: { ...this.headers(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); }
  getRegistrations(token: string) { return this.request<Registration[]>('/account/registrations', { headers: this.headers(token) }); }
  createRaceOrder(input: CreateRaceOrderInput, token: string) { return this.request<RaceOrderResult>(`/races/${encodeURIComponent(input.raceSlug)}/orders`, { ...this.jsonPost(input), headers: { ...this.headers(token), 'Idempotency-Key': input.idempotencyKey, 'Content-Type': 'application/json' } }); }

  private headers(token?: string) { return { 'X-Api-Key': this.apiKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) }; }
  private jsonPost(body: unknown): RequestInit { return { method: 'POST', headers: { ...this.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { ...this.headers(), ...(init.headers ?? {}) } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = unknownObject.parse(payload);
      throw new RacePortalError(String(error.message ?? 'Galileo no pudo completar la solicitud'), String(error.code ?? 'GALILEO_ERROR'), response.status);
    }
    return payload as T;
  }
}

function matchesRaceLookup(item: unknown, slug: string): boolean {
  if (!item || typeof item !== 'object') return false;
  const race = item as IntegrationsRace & Partial<RaceSummary>;
  if (race.slug === slug || race.id === slug) return true;
  if (race.id && race.name) return slugifyRace(race.name, race.id) === slug;
  return false;
}
