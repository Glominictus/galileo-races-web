import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, json, setSessionToken } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { documentSchema } from '@/lib/domain/auth/identity';

const schema = z.object({
  dni: documentSchema,
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(100, 'La contraseña no puede superar los 100 caracteres.'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const input = schema.parse(await request.json());
    const session = await getRacePortalClient().login(input);
    setSessionToken(cookies, session.token, session.account);
    return json(session.account, { status: 200 });
  } catch (error: unknown) {
    return apiError(error);
  }
};
