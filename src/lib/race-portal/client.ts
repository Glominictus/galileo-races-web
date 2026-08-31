import type { CreateRaceOrderInput, LoginInput, PortalAccount, PortalSession, RaceAvailability, RaceDetail, RaceFilters, RaceOrderResult, RacePage, RegisterInput, Registration } from './types';

export class RacePortalError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 400) {
    super(message);
    this.name = 'RacePortalError';
  }
}

export interface RacePortalClient {
  listRaces(filters?: RaceFilters): Promise<RacePage>;
  getRace(slug: string): Promise<RaceDetail>;
  getAvailability(slug: string): Promise<RaceAvailability>;
  login(input: LoginInput): Promise<PortalSession>;
  register(input: RegisterInput): Promise<PortalSession>;
  getAccount(token: string): Promise<PortalAccount>;
  getRegistrations(token: string): Promise<Registration[]>;
  createRaceOrder(input: CreateRaceOrderInput, token: string): Promise<RaceOrderResult>;
}
