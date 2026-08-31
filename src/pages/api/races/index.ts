import type { APIRoute } from 'astro';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { apiError, json } from '@/lib/api-response';
import type { RaceStatus, RaceType } from '@/lib/race-portal/types';

export const GET: APIRoute = async ({ url }) => {
  try {
    return json(await getRacePortalClient().listRaces({
      query: url.searchParams.get('query') ?? undefined,
      province: url.searchParams.get('province') ?? undefined,
      type: (url.searchParams.get('type') as RaceType | null) ?? undefined,
      status: (url.searchParams.get('status') as RaceStatus | null) ?? undefined,
    }), { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } });
  } catch (error) { return apiError(error); }
};
