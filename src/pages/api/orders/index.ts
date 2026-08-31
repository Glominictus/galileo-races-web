import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, getSessionToken, json } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';

const schema = z.object({
  raceSlug: z.string().min(1),
  modalityId: z.string().min(1),
  participant: z.object({
    firstName: z.string().trim().min(2), lastName: z.string().trim().min(2),
    documentType: z.enum(['dni', 'nie', 'passport']), document: z.string().trim().min(3),
    birthDate: z.iso.date(), phone: z.string().trim().min(6), club: z.string().optional(),
  }),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = getSessionToken(cookies);
  if (!token) return json({ message: 'Inicia sesión para continuar', code: 'AUTH_REQUIRED' }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const idempotencyKey = request.headers.get('Idempotency-Key')?.trim();
    if (!idempotencyKey) return json({ message: 'Falta la clave de idempotencia', code: 'IDEMPOTENCY_REQUIRED' }, { status: 400 });
    return json(await getRacePortalClient().createRaceOrder({ ...input, idempotencyKey }, token), { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { if (error instanceof z.ZodError) return json({ message: 'Revisa los datos del participante', code: 'INVALID_INPUT' }, { status: 400 }); return apiError(error); }
};
