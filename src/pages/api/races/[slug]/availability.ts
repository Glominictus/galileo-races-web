import type { APIRoute } from 'astro';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { apiError, json } from '@/lib/api-response';

export const GET: APIRoute = async ({ params }) => {
  try { return json(await getRacePortalClient().getAvailability(params.slug ?? ''), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
};
