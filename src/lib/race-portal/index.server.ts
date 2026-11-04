import type { RacePortalClient } from './client';
import { RacePortalError } from './client';
import { GalileoRacePortalClient } from './http-client.server';
import { MockRacePortalClient } from './mock-client.server';
import type {
  CreateRaceOrderInput,
  LoginInput,
  RaceFilters,
  RegisterInput,
  UpdateAccountInput,
} from './types';

function getEnv(key: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? process.env[key];
}

export function shouldFallbackToMock(error: unknown): boolean {
  if (!(error instanceof RacePortalError)) {
    return true;
  }

  if (error.status < 500) {
    return (
      error.status === 404
      && error.code !== 'RACE_NOT_FOUND'
      && error.code !== 'MODALITY_NOT_FOUND'
    );
  }

  return true;
}

export class ResilientRacePortalClient implements RacePortalClient {
  private readonly fallback: RacePortalClient;

  constructor(
    private readonly primary: RacePortalClient,
    fallback?: RacePortalClient,
  ) {
    this.fallback = fallback ?? new MockRacePortalClient();
  }

  private async execute<T>(fn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }

      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `[Galileo Service] Servicio remoto no disponible (${reason}), usando contingencia local.`
      );
      return await fallbackFn();
    }
  }

  listRaces(filters?: RaceFilters) {
    return this.execute(() => this.primary.listRaces(filters), () => this.fallback.listRaces(filters));
  }
  getRace(slug: string) {
    return this.execute(() => this.primary.getRace(slug), () => this.fallback.getRace(slug));
  }
  getAvailability(slug: string) {
    return this.execute(() => this.primary.getAvailability(slug), () => this.fallback.getAvailability(slug));
  }
  login(input: LoginInput) {
    return this.execute(() => this.primary.login(input), () => this.fallback.login(input));
  }
  register(input: RegisterInput) {
    return this.execute(() => this.primary.register(input), () => this.fallback.register(input));
  }
  getAccount(token: string) {
    return this.execute(() => this.primary.getAccount(token), () => this.fallback.getAccount(token));
  }
  updateAccount(input: UpdateAccountInput, token: string) {
    return this.execute(() => this.primary.updateAccount(input, token), () => this.fallback.updateAccount(input, token));
  }
  getRegistrations(token: string) {
    return this.execute(() => this.primary.getRegistrations(token), () => this.fallback.getRegistrations(token));
  }
  createRaceOrder(input: CreateRaceOrderInput, token: string) {
    return this.execute(() => this.primary.createRaceOrder(input, token), () => this.fallback.createRaceOrder(input, token));
  }
}

export function getRacePortalClient(): RacePortalClient {
  const useMocks = String(getEnv('GALILEO_USE_MOCKS') ?? 'true').toLowerCase() !== 'false';
  if (useMocks) return new MockRacePortalClient();
  const baseUrl = String(getEnv('GALILEO_API_URL') ?? '').replace(/\/$/, '');
  const apiKey = String(getEnv('GALILEO_RACE_PORTAL_API_KEY') ?? '');
  if (!baseUrl || !apiKey) {
    console.warn('[Galileo] Faltan GALILEO_API_URL o GALILEO_RACE_PORTAL_API_KEY, usando Mock.');
    return new MockRacePortalClient();
  }
  return new ResilientRacePortalClient(new GalileoRacePortalClient(baseUrl, apiKey));
}
