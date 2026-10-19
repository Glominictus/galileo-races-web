import type { RaceDetail, RaceFilters, RaceModality, RaceStatus, RaceSummary, RaceType } from './types';

/** Raw Galileo integrations product race (subset used by the portal). */
export interface IntegrationsRace {
  id: string;
  name: string;
  thumb?: string | null;
  content?: string | null;
  showPublic?: boolean;
  isHistoric?: boolean;
  installation?: { id?: string; name?: string } | null;
  raceConfig?: {
    organizerName?: string | null;
    organizerUrl?: string | null;
    raceType?: string | null;
    province?: string | null;
    city?: string | null;
    raceStartAt?: string | null;
    raceEndAt?: string | null;
    startLocationInfo?: string | null;
    startLocationLat?: string | number | null;
    startLocationLng?: string | number | null;
    maxRegistrations?: number | null;
  } | null;
  raceEvents?: IntegrationsRaceEvent[] | null;
  registeredCount?: number | null;
}

export interface IntegrationsRaceEvent {
  id: string;
  name: string;
  description?: string | null;
  startAt?: string | null;
  inscriptionStartAt?: string | null;
  inscriptionEndAt?: string | null;
  distance?: string | number | null;
  raceType?: string | null;
  maxRegistrations?: number | null;
  defaultPrice?: string | number | null;
  allowRegistrations?: boolean | null;
  isPublished?: boolean | null;
  inscriptionsCount?: number | null;
  prices?: Array<{ amount?: string | number | null }> | null;
}

export function slugifyRace(name: string, id: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'carrera'}-${id.slice(0, 8)}`;
}

function mapRaceType(raw?: string | null): RaceType {
  const value = (raw ?? '').toLowerCase();
  if (value.includes('trail') || value.includes('mountain')) return 'trail';
  if (value.includes('andaina') || value.includes('walk') || value.includes('hike')) return 'andaina';
  return 'asfalto';
}

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function eventPrice(event: IntegrationsRaceEvent): number {
  const fromPrices = (event.prices ?? [])
    .map((price) => toNumber(price.amount, Number.NaN))
    .filter((amount) => Number.isFinite(amount));
  if (fromPrices.length) return Math.min(...fromPrices);
  return toNumber(event.defaultPrice, 0);
}

function modalityStatus(event: IntegrationsRaceEvent, now: Date): RaceStatus {
  if (!event.isPublished) return 'closed';
  const capacity = event.maxRegistrations ?? 0;
  const taken = event.inscriptionsCount ?? 0;
  if (capacity > 0 && taken >= capacity) return 'sold-out';

  const inscriptionStart = event.inscriptionStartAt ? new Date(event.inscriptionStartAt) : null;
  const inscriptionEnd = event.inscriptionEndAt ? new Date(event.inscriptionEndAt) : null;
  if (inscriptionEnd && inscriptionEnd < now) return 'closed';
  if (inscriptionStart && inscriptionStart > now) return 'upcoming';
  if (event.allowRegistrations === false) return 'closed';
  return 'open';
}

function raceStatus(events: IntegrationsRaceEvent[], isHistoric: boolean, now: Date): RaceStatus {
  if (isHistoric) return 'closed';
  if (!events.length) return 'upcoming';
  const statuses = events.map((event) => modalityStatus(event, now));
  if (statuses.some((status) => status === 'open')) return 'open';
  if (statuses.every((status) => status === 'sold-out')) return 'sold-out';
  if (statuses.some((status) => status === 'upcoming')) return 'upcoming';
  return 'closed';
}

function distanceLabel(events: IntegrationsRaceEvent[]): string {
  const labels = events
    .map((event) => {
      const distance = toNumber(event.distance, Number.NaN);
      if (!Number.isFinite(distance) || distance <= 0) return null;
      const formatted = Number.isInteger(distance) ? String(distance) : String(distance).replace('.', ',');
      return `${formatted} km`;
    })
    .filter((label): label is string => Boolean(label));
  return [...new Set(labels)].join(' · ') || 'Distancia por confirmar';
}

function mapModalities(events: IntegrationsRaceEvent[], now: Date): RaceModality[] {
  return events.map((event) => {
    const capacity = event.maxRegistrations ?? 0;
    const taken = event.inscriptionsCount ?? 0;
    return {
      id: event.id,
      name: event.name,
      distanceKm: toNumber(event.distance, 0),
      startAt: event.startAt ?? new Date(0).toISOString(),
      registrationEndsAt: event.inscriptionEndAt ?? event.startAt ?? new Date(0).toISOString(),
      priceFrom: eventPrice(event),
      capacity,
      availablePlaces: Math.max(0, capacity - taken),
      status: modalityStatus(event, now),
    };
  });
}

export function mapIntegrationsRaceToDetail(raw: IntegrationsRace, now = new Date()): RaceDetail {
  const config = raw.raceConfig ?? {};
  const events = (raw.raceEvents ?? []).filter((event) => event.isPublished !== false);
  const modalities = mapModalities(events, now);
  const startsAt = config.raceStartAt
    ?? events.map((event) => event.startAt).filter(Boolean).sort()[0]
    ?? new Date(0).toISOString();
  const registrationEndsAt = events
    .map((event) => event.inscriptionEndAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const prices = modalities.map((modality) => modality.priceFrom).filter((price) => price > 0);
  const lat = toNumber(config.startLocationLat, Number.NaN);
  const lng = toNumber(config.startLocationLng, Number.NaN);

  const summary: RaceSummary = {
    id: raw.id,
    slug: slugifyRace(raw.name, raw.id),
    name: raw.name,
    startsAt,
    city: config.city?.trim() || 'Galicia',
    province: config.province?.trim() || 'Galicia',
    distanceLabel: distanceLabel(events),
    type: mapRaceType(config.raceType ?? events[0]?.raceType),
    priceFrom: prices.length ? Math.min(...prices) : 0,
    imageUrl: raw.thumb || '/images/hero-running-galicia.png',
    status: raceStatus(events, Boolean(raw.isHistoric), now),
    featured: Boolean(raw.showPublic) && !raw.isHistoric,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
    registrationEndsAt,
  };

  return {
    ...summary,
    organizer: {
      id: raw.installation?.id || 'organizer',
      name: config.organizerName || raw.installation?.name || 'Organizador',
      website: config.organizerUrl || undefined,
    },
    description: raw.content?.trim() || `Información de ${raw.name}.`,
    locationName: config.startLocationInfo?.trim() || summary.city,
    modalities,
    schedule: [],
    included: [],
    seoDescription: `${raw.name} en ${summary.city}, ${summary.province}.`,
  };
}

export function mapIntegrationsRaceToSummary(raw: IntegrationsRace, now = new Date()): RaceSummary {
  const detail = mapIntegrationsRaceToDetail(raw, now);
  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    startsAt: detail.startsAt,
    city: detail.city,
    province: detail.province,
    distanceLabel: detail.distanceLabel,
    type: detail.type,
    priceFrom: detail.priceFrom,
    imageUrl: detail.imageUrl,
    status: detail.status,
    featured: detail.featured,
    latitude: detail.latitude,
    longitude: detail.longitude,
    registrationEndsAt: detail.registrationEndsAt,
  };
}

export function filterRaceSummaries(items: RaceSummary[], filters: RaceFilters = {}): RaceSummary[] {
  const query = filters.query?.trim().toLocaleLowerCase('es') ?? '';
  return items.filter((race) => {
    const matchesQuery = !query || [race.name, race.city, race.province].some((value) => value.toLocaleLowerCase('es').includes(query));
    return matchesQuery
      && (!filters.province || race.province === filters.province)
      && (!filters.type || race.type === filters.type)
      && (!filters.status || race.status === filters.status);
  });
}

export function normalizeRacePagePayload(payload: unknown): { items: unknown[]; total?: number } | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return { items: record.items, total: typeof record.total === 'number' ? record.total : undefined };
  if (Array.isArray(record.data)) return { items: record.data, total: typeof record.count === 'number' ? record.count : undefined };
  return null;
}
