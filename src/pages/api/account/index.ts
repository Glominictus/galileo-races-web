import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, getSessionToken, json, setSessionToken } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';

export const GET: APIRoute = async ({ cookies }) => {
  const token = getSessionToken(cookies);
  if (!token) return json({ message: 'Inicia sesión para continuar', code: 'AUTH_REQUIRED' }, { status: 401 });
  try {
    return json(await getRacePortalClient().getAccount(token), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiError(error);
  }
};

const updateSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  birthDate: z.string().trim().optional(),
  club: z.string().trim().optional(),
});

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const token = getSessionToken(cookies);
  if (!token) return json({ message: 'Inicia sesión para continuar', code: 'AUTH_REQUIRED' }, { status: 401 });

  try {
    const body = await request.json();
    const input = updateSchema.parse(body);
    const updatedAccount = await getRacePortalClient().updateAccount(input, token);

    // Actualizamos la cookie de sesión del navegador con los nuevos datos
    setSessionToken(cookies, token, updatedAccount);

    return json(updatedAccount);
  } catch (error) {
    return apiError(error);
  }
};
