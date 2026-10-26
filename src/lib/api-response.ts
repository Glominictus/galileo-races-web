import type { AstroCookies } from 'astro';
import { RacePortalError } from './race-portal/client';
import type { PortalAccount } from './race-portal/types';

export const SESSION_COOKIE = 'pulso_session';
export const ACCOUNT_COOKIE = 'pulso_account';

export function getSessionToken(cookies: AstroCookies) {
  return cookies.get(SESSION_COOKIE)?.value ?? '';
}

export function setSessionToken(cookies: AstroCookies, token: string, account?: PortalAccount) {
  const cookieOptions = {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  };

  cookies.set(SESSION_COOKIE, token, cookieOptions);

  if (account) {
    cookies.set(ACCOUNT_COOKIE, JSON.stringify(account), cookieOptions);
  }
}

export function getStoredAccount(cookies: AstroCookies): PortalAccount | null {
  const raw = cookies.get(ACCOUNT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalAccount;
  } catch {
    return null;
  }
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  cookies.delete(ACCOUNT_COOKIE, { path: '/' });
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
