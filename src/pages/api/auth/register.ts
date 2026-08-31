import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, json, setSessionToken } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';

const schema = z.object({ firstName: z.string().trim().min(2), lastName: z.string().trim().min(2), email: z.email(), password: z.string().min(8) });
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const input = schema.parse(await request.json());
    const session = await getRacePortalClient().register(input);
    setSessionToken(cookies, session.token);
    return json(session.account, { status: 201 });
  } catch (error) { if (error instanceof z.ZodError) return json({ message: 'Completa todos los datos correctamente', code: 'INVALID_INPUT' }, { status: 400 }); return apiError(error); }
};
