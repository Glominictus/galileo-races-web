/**
 * Dominio Carreras: Búsqueda y filtrado centralizado
 */

import type { RaceStatus, RaceSummary, RaceType } from '@/lib/race-portal/types';
import { matchesDistance } from './distances';

export interface RaceFilterCriteria {
  query?: string;
  province?: string;
  type?: RaceType | '';
  status?: RaceStatus | '';
  onlyOpen?: boolean;
  distance?: string;
}

/**
 * Comprueba si una carrera coincide con un término de búsqueda textual o por distancia (ej. "10k").
 */
export function matchesQuery(race: RaceSummary, term: string): boolean {
  const normalizedTerm = term.trim().toLocaleLowerCase('es');
  if (!normalizedTerm) return true;

  const inTextFields = [race.name, race.city, race.province, race.distanceLabel].some((value) =>
    (value ?? '').toLocaleLowerCase('es').includes(normalizedTerm)
  );
  if (inTextFields) return true;

  // Si busca "10k", "21k", etc., comprobar la distancia numérica exacta
  const kMatch = normalizedTerm.match(/^(\d+(?:[.,]\d+)?)\s*k$/);
  if (kMatch) {
    return matchesDistance(race.distanceLabel, kMatch[1]);
  }

  return false;
}

/**
 * Filtra una lista de carreras según múltiples criterios combinables.
 */
export function filterRaces(races: RaceSummary[], criteria: RaceFilterCriteria = {}): RaceSummary[] {
  const { query = '', province = '', type = '', status = '', onlyOpen = false, distance = '' } = criteria;

  return races.filter((race) => {
    if (query && !matchesQuery(race, query)) return false;
    if (province && race.province !== province) return false;
    if (type && race.type !== type) return false;
    if (status && race.status !== status) return false;
    if (onlyOpen && race.status !== 'open') return false;
    if (distance && !matchesDistance(race.distanceLabel, distance)) return false;
    return true;
  });
}

/**
 * Barrera de validación: Determina si una carrera está abierta y disponible para participar:
 * 1. Su estado formal debe ser 'open' (descarta 'closed', 'sold-out' y 'upcoming').
 * 2. Su fecha de celebración debe ser futura (startsAt > now).
 * 3. Si tiene fecha límite de inscripción (registrationEndsAt), tampoco debe haber vencido.
 */
export function isRaceOpen(
  race: Pick<RaceSummary, 'status' | 'startsAt'> & Partial<Pick<RaceSummary, 'registrationEndsAt'>>,
  now: number = Date.now()
): boolean {
  if (race.status !== 'open') return false;

  const startsAt = new Date(race.startsAt).getTime();
  if (Number.isNaN(startsAt) || startsAt <= now) return false;

  if (race.registrationEndsAt) {
    const regEndsAt = new Date(race.registrationEndsAt).getTime();
    if (!Number.isNaN(regEndsAt) && regEndsAt <= now) return false;
  }

  return true;
}
