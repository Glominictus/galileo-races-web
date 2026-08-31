export type RaceStatus = 'open' | 'upcoming' | 'sold-out' | 'closed';
export type RaceType = 'asfalto' | 'trail' | 'andaina';

export interface RaceOrganizer { id: string; name: string; logoUrl?: string; website?: string; }
export interface RaceModality { id: string; name: string; distanceKm: number; startAt: string; registrationEndsAt: string; priceFrom: number; capacity: number; availablePlaces: number; status: RaceStatus; }
export interface RaceSummary { id: string; slug: string; name: string; city: string; province: string; type: RaceType; startsAt: string; registrationEndsAt: string; imageUrl: string; distanceLabel: string; priceFrom: number; status: RaceStatus; featured?: boolean; organizer: RaceOrganizer; }
export interface RaceDetail extends RaceSummary { description: string; locationName: string; latitude: number; longitude: number; modalities: RaceModality[]; schedule: Array<{ time: string; label: string }>; included: string[]; rulesUrl?: string; seoDescription: string; }
export interface RaceFilters { query?: string; province?: string; type?: RaceType | ''; status?: RaceStatus | ''; }
export interface RacePage { items: RaceSummary[]; total: number; }
export interface RaceAvailability { raceId: string; modalities: Array<Pick<RaceModality, 'id' | 'availablePlaces' | 'status'>>; checkedAt: string; }
export interface PortalAccount { id: string; email: string; firstName: string; lastName: string; emailVerified: boolean; }
export interface PortalSession { token: string; account: PortalAccount; }
export interface Registration { id: string; raceSlug: string; raceName: string; eventName: string; startsAt: string; location: string; participantName: string; bibNumber?: number; paidState: 'paid' | 'pending' | 'failed'; total: number; imageUrl: string; }
export interface ParticipantInput { firstName: string; lastName: string; documentType: 'dni' | 'nie' | 'passport'; document: string; birthDate: string; phone: string; club?: string; }
export interface CreateRaceOrderInput { raceSlug: string; modalityId: string; participant: ParticipantInput; idempotencyKey: string; }
export interface RaceOrderResult { orderId: string; paidState: 'pending'; total: number; paymentUrl: string; }
export interface LoginInput { email: string; password: string; }
export interface RegisterInput extends LoginInput { firstName: string; lastName: string; }
