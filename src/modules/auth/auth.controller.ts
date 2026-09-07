import 'server-only';

import { ok, type ApiSuccess } from '@/lib/http/response';
import type { NextResponse } from 'next/server';
import { loginSchema } from './auth.schema';
import type { AdminUser, SessionPayload } from './auth.types';
import * as service from './auth.service';
import { clearSessionCookie, setSessionCookie } from './session';

/**
 * Controllers validate, delegate and shape the response. No business rules here.
 */

export async function handleLogin(request: Request): Promise<NextResponse<ApiSuccess<AdminUser>>> {
  const body: unknown = await request.json().catch(() => ({}));
  const input = loginSchema.parse(body);

  const { user, token } = await service.login(input, request);
  await setSessionCookie(token);

  return ok(user);
}

export async function handleLogout(): Promise<NextResponse<ApiSuccess<{ signedOut: true }>>> {
  await clearSessionCookie();
  return ok({ signedOut: true } as const);
}

export async function handleMe(): Promise<NextResponse<ApiSuccess<SessionPayload>>> {
  const session = await service.requireAdmin();
  return ok(session);
}
