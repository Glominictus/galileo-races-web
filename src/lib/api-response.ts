import type { AstroCookies } from 'astro';
import { RacePortalError } from './race-portal/client';

export const SESSION_COOKIE = 'pulso_session';

export function getSessionToken(cookies: AstroCookies) {
  return cookies.get(SESSION_COOKIE)?.value ?? '';
}

export function setSessionToken(cookies: AstroCookies, token: string) {
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function apiError(error: unknown) {
  if (error instanceof RacePortalError) {
    return new Response(JSON.stringify({ message: error.message, code: error.code }), {
      status: error.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  console.error(error);
  return new Response(JSON.stringify({ message: 'No pudimos completar la solicitud', code: 'INTERNAL_ERROR' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
}
