import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, json, setSessionToken } from '@/lib/api-response';
import { RacePortalError } from '@/lib/race-portal/client';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { documentSchema } from '@/lib/domain/auth/identity';

const schema = z.object({
  dni: documentSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const input = schema.parse(await request.json());

    try {
      const session = await getRacePortalClient().login(input);
      setSessionToken(cookies, session.token, session.account);
      return json(session.account, { status: 200 });
    } catch (clientError: unknown) {
      if (clientError instanceof RacePortalError && (clientError.status === 401 || clientError.status === 400)) {
        return json({ message: clientError.message, code: clientError.code }, { status: clientError.status });
      }

      // Fallback para modo demo si no hay backend activo
      if (input.dni === '12345678Z') {
        const fallbackToken = `session_${Date.now()}`;
        const fallbackAccount = {
          id: 'account-demo',
          dni: '12345678Z',
          email: 'corredora@pulso.gal',
          firstName: 'Iria',
          lastName: 'Varela',
          emailVerified: true,
        };

        setSessionToken(cookies, fallbackToken, fallbackAccount);
        return json(fallbackAccount, { status: 200 });
      }

      return json(
        {
          message:
            'DNI no registrado o credenciales inválidas. En modo demo utiliza el DNI 12345678Z (Iria Varela) o regístrate en Crear cuenta.',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    return apiError(error);
  }
};
