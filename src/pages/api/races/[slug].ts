import type { APIRoute } from 'astro';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { apiError, json } from '@/lib/api-response';

export const GET: APIRoute = async ({ params }) => {
  try { return json(await getRacePortalClient().getRace(params.slug ?? ''), { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } }); }
  catch (error) { return apiError(error); }
};
