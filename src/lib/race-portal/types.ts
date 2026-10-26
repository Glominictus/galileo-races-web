export type RaceStatus = 'open' | 'upcoming' | 'sold-out' | 'closed';
export type RaceType = 'asfalto' | 'trail' | 'andaina';

export interface RaceOrganizer {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface RaceModality {
  id: string;
  name: string;
  distanceKm: number;
  startAt: string;
  registrationEndsAt: string;
  priceFrom: number;
  capacity: number;
  availablePlaces: number;
  status: RaceStatus;
}

export interface RaceSummary {
  id: string;
  slug: string;
  name: string;
  startsAt: string;
  city: string;
  province: string;
  distanceLabel: string;
  type: RaceType;
  priceFrom: number;
  imageUrl: string;
  status: RaceStatus;
  featured?: boolean;

  // Campos agregados para geolocalización y límites de inscripción
  latitude?: number;
  longitude?: number;
  registrationEndsAt?: string;
}

export interface RaceScheduleItem {
  time: string;
  label: string;
}

export interface RaceDetail extends RaceSummary {
  organizer: RaceOrganizer;
  description: string;
  locationName: string;
  modalities: RaceModality[];
  schedule: RaceScheduleItem[];
  included: string[];
  rulesUrl?: string;
  seoDescription?: string;
}

export interface RaceFilters {
  query?: string;
  province?: string;
  type?: RaceType | '';
  status?: RaceStatus | '';
}

export interface RacePage {
  items: RaceSummary[];
  total: number;
}

export interface RaceAvailability {
  raceId: string;
  modalities: Array<Pick<RaceModality, 'id' | 'availablePlaces' | 'status'>>;
  checkedAt: string;
}

export interface PortalAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  emailVerified: boolean;
}

export interface PortalSession {
  token: string;
  account: PortalAccount;
}

export interface Registration {
  id: string;
  raceSlug: string;
  raceName: string;
  eventName: string;
  startsAt: string;
  location: string;
  participantName: string;
  bibNumber?: number;
  paidState: 'paid' | 'pending' | 'failed';
  total: number;
  imageUrl: string;
}

export interface ParticipantInput {
  firstName: string;
  lastName: string;
  documentType: 'dni' | 'nie' | 'passport';
  document: string;
  birthDate: string;
  phone: string;
  club?: string;
}

export interface CreateRaceOrderInput {
  raceSlug: string;
  modalityId: string;
  participant: ParticipantInput;
  idempotencyKey: string;
}

export interface RaceOrderResult {
  orderId: string;
  paidState: 'pending';
  total: number;
  paymentUrl: string;
}

export interface LoginInput {
  dni: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  firstName: string;
  lastName: string;
  email: string;
}