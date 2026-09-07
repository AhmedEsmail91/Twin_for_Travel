import 'server-only';

import { RateLimitError, UnauthorizedError } from '@/lib/http/errors';
import { clientIp, rateLimit, resetRateLimit } from '@/lib/security/rate-limit';
import * as repository from './auth.repository';
import type { AdminUser, SessionPayload } from './auth.types';
import { verifyPassword } from './password';
import type { LoginInput } from './auth.schema';
import { createSessionToken, getSession } from './session';

/**
 * Authentication rules.
 *
 * Failure messages are deliberately identical for "no such account" and "wrong
 * password" so the endpoint cannot be used to enumerate admin addresses.
 */

const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function login(
  input: LoginInput,
  request: Request,
): Promise<{ user: AdminUser; token: string }> {
  const key = `login:${clientIp(request)}:${input.email}`;
  const limit = rateLimit(key, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);

  if (!limit.allowed) {
    throw new RateLimitError(
      limit.retryAfterSeconds,
      'Too many sign-in attempts. Please wait before trying again.',
    );
  }

  const record = await repository.findUserWithHashByEmail(input.email);

  /*
   * Always run a verification, even when the account doesn't exist, so the response
   * takes the same time either way and cannot be used to probe for valid addresses.
   */
  const passwordMatches = record
    ? await verifyPassword(input.password, record.passwordHash)
    : await verifyPassword(input.password, DUMMY_HASH).then(() => false);

  if (!record || !passwordMatches) {
    throw new UnauthorizedError('Incorrect email or password', 'INVALID_CREDENTIALS');
  }

  resetRateLimit(key);
  await repository.touchLastLogin(record.id);

  const token = await createSessionToken({
    sub: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
  });

  const { passwordHash: _passwordHash, ...user } = record;
  return { user, token };
}

/**
 * The server-side authorisation guard.
 *
 * Called at the top of every admin page and every admin route handler. The proxy's
 * cookie check is only a redirect optimisation — this is the authority. CLAUDE.md §9.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new UnauthorizedError('You must be signed in to do that');
  }
  return session;
}

/** Non-throwing variant, for UI that renders differently when signed in. */
export async function getCurrentAdmin(): Promise<SessionPayload | null> {
  return getSession();
}

/**
 * A real scrypt hash of a random value, used only to keep the timing of a failed
 * lookup comparable to a failed password check.
 */
const DUMMY_HASH =
  'scrypt$32768$8$1$N50tCk3pYptJhHU3zRCmew==$' +
  'xcV12gNMPInBNSKsWhPBP7L7Vn4Udg1lIHyNbuySUUbqVGEj2BhKeLZ8ewHsIZ/WvbAVMZSc16PqZ1D/Izof8w==';
