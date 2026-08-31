import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, json, setSessionToken } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';

const schema = z.object({ email: z.email(), password: z.string().min(8) });
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const input = schema.parse(await request.json());
    const session = await getRacePortalClient().login(input);
    setSessionToken(cookies, session.token);
    return json(session.account);
  } catch (error) { if (error instanceof z.ZodError) return json({ message: 'Revisa el email y la contraseña', code: 'INVALID_INPUT' }, { status: 400 }); return apiError(error); }
};
