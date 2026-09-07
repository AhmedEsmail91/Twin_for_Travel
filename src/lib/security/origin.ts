import 'server-only';

import { APP_URL } from '@/config/site';
import { ForbiddenError } from '@/lib/http/errors';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF defence.
 *
 * The session cookie is `SameSite=Lax`, which already blocks cross-site POSTs from
 * forms and sub-resources. This adds the second half of the standard defence: every
 * mutating request must declare an `Origin` (or `Referer`) that matches the app's
 * own origin. A cross-site attacker cannot forge either header from a browser.
 *
 * See CLAUDE.md §16.
 */
export function assertSameOrigin(request: Request): void {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return;

  const expected = new URL(APP_URL).origin;
  const declared = request.headers.get('origin') ?? refererOrigin(request);

  // Same-origin requests from some non-browser clients omit both headers. Allowing
  // them would defeat the check, so an absent origin is treated as a mismatch.
  if (declared !== expected) {
    throw new ForbiddenError('Request origin is not allowed');
  }
}

function refererOrigin(request: Request): string | null {
  const referer = request.headers.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}
