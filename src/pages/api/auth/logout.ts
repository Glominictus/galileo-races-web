import type { APIRoute } from 'astro';
import { clearSessionCookies, json } from '@/lib/api-response';

export const POST: APIRoute = async ({ cookies }) => {
  clearSessionCookies(cookies);
  return json({ ok: true }, { status: 200 });
};
