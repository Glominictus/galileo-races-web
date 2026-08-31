import { z } from 'zod';
import type { RacePortalClient } from './client';
import { RacePortalError } from './client';
import type { CreateRaceOrderInput, LoginInput, PortalAccount, PortalSession, RaceAvailability, RaceDetail, RaceFilters, RaceOrderResult, RacePage, RegisterInput, Registration } from './types';

const unknownObject = z.object({}).loose();

export class GalileoRacePortalClient implements RacePortalClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}
  listRaces(filters: RaceFilters = {}) { const query = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => value && query.set(key, value)); return this.request<RacePage>(`/races?${query}`); }
  getRace(slug: string) { return this.request<RaceDetail>(`/races/${encodeURIComponent(slug)}`); }
  getAvailability(slug: string) { return this.request<RaceAvailability>(`/races/${encodeURIComponent(slug)}/availability`, { cache: 'no-store' }); }
  login(input: LoginInput) { return this.request<PortalSession>('/auth/login', this.jsonPost(input)); }
  register(input: RegisterInput) { return this.request<PortalSession>('/auth/register', this.jsonPost(input)); }
  getAccount(token: string) { return this.request<PortalAccount>('/account', { headers: this.headers(token) }); }
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
