import type { APIRoute } from 'astro';
import { apiError, getSessionToken, json } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';

export const GET: APIRoute = async ({ cookies }) => {
  const token = getSessionToken(cookies);
  if (!token) return json({ message: 'Inicia sesión para continuar', code: 'AUTH_REQUIRED' }, { status: 401 });
  try { return json(await getRacePortalClient().getAccount(token), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
};
