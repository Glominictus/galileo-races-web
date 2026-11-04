import type { APIRoute } from 'astro';
import { z } from 'zod';
import { apiError, json, setSessionToken } from '@/lib/api-response';
import { getRacePortalClient } from '@/lib/race-portal/index.server';
import { isValidDniOrNie, normalizeDocument } from '@/lib/domain/auth/identity';

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(255, 'El nombre no puede superar los 255 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
    .max(255, 'Los apellidos no pueden superar los 255 caracteres.'),
  dniType: z.enum(['dni', 'nie']).default('dni'),
  dni: z
    .string()
    .trim()
    .min(5, 'Introduce un número de documento válido.')
    .max(50, 'El documento no puede superar los 50 caracteres.')
    .transform(normalizeDocument),
  email: z
    .email('Introduce un correo electrónico válido.')
    .max(255, 'El correo electrónico no puede superar los 255 caracteres.'),
  confirmEmail: z
    .email('Introduce el mismo correo electrónico.')
    .max(255, 'El correo electrónico no puede superar los 255 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(9, 'Introduce un teléfono de al menos 9 dígitos.')
    .max(50, 'El teléfono no puede superar los 50 caracteres.'),
  birthDate: z.string().min(1, 'Indica tu fecha de nacimiento.'),
  gender: z.enum(['femenino', 'masculino', 'otro'], {
    message: 'Por favor, selecciona una opción de género.',
  }),
  country: z
    .string()
    .trim()
    .max(100, 'El país no puede superar los 100 caracteres.')
    .optional()
    .default('España'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(100, 'La contraseña no puede superar los 100 caracteres.'),
  confirmPassword: z
    .string()
    .min(8, 'Repite la contraseña.')
    .max(100, 'La contraseña no puede superar los 100 caracteres.'),
  acceptedTerms: z.preprocess(
    (val) => val === true || val === 'on' || val === 'true',
    z.literal(true, {
      message: 'Debes aceptar los términos y condiciones y la política de privacidad.',
    })
  ),
})
.refine((data) => {
  if (data.dniType === 'nie') return /^[XYZ]\d{7}[A-Z]$/.test(data.dni);
  return /^\d{8}[A-Z]$/.test(data.dni);
}, {
  message: 'Introduce un documento con formato válido para la opción seleccionada (ej. 12345678Z para DNI o X1234567A para NIE).',
  path: ['dni'],
})
.refine((data) => isValidDniOrNie(data.dni), {
  message: 'La letra del DNI o NIE no es correcta según el algoritmo oficial.',
  path: ['dni'],
})
.refine((data) => data.email.toLowerCase() === data.confirmEmail.toLowerCase(), {
  message: 'Los correos electrónicos no coinciden.',
  path: ['confirmEmail'],
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'], 
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const input = schema.parse(await request.json());
    const session = await getRacePortalClient().register(input);
    setSessionToken(cookies, session.token, session.account);
    return json(session.account, { status: 201 });
  } catch (error: unknown) {
    return apiError(error);
  }
};
