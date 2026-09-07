import 'server-only';

import { APP_URL } from '@/config/site';
import { ForbiddenError } from '@/lib/http/errors';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF defence.
 *
 * The session cookie is `SameSite=Lax`, which already blocks cross-site POSTs from
 * forms and sub-resources. This adds the second half of the standard defence: every
 * mutating request must declare an `Origin` (or `Referer`) matching the origin it
 * was actually sent to. A cross-site attacker cannot forge either header from a
 * browser, so a mismatch means the request did not come from our own pages.
 *
 * The comparison is against the origin the request *arrived on*, derived from the
 * `Host` header, with the configured `APP_URL` accepted as well for deployments
 * behind a proxy that rewrites the host.
 *
 * Deriving it from the request rather than from configuration alone matters: when
 * the two drift — the app served on one port while `NEXT_PUBLIC_APP_URL` names
 * another — a configuration-only check rejects every genuine save in the dashboard
 * with a 403 that looks like "nothing happens when I change the status".
 *
 * See CLAUDE.md §16.
 */
export function assertSameOrigin(request: Request): void {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return;

  const declared = request.headers.get('origin') ?? refererOrigin(request);

  // Same-origin requests from some non-browser clients omit both headers. Allowing
  // them would defeat the check, so an absent origin is treated as a mismatch.
  if (!declared || !allowedOrigins(request).has(declared)) {
    throw new ForbiddenError('Request origin is not allowed');
  }
}

function allowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>();

  // The origin this request was actually addressed to.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host) {
    const protocol =
      request.headers.get('x-forwarded-proto') ??
      (isLocalHost(host) ? 'http' : new URL(request.url).protocol.replace(':', ''));
    allowed.add(`${protocol}://${host}`);
  }

  // The configured public origin, for proxied deployments.
  try {
    allowed.add(new URL(APP_URL).origin);
  } catch {
    // A malformed APP_URL must not disable the host-derived check above.
  }

  return allowed;
}

function isLocalHost(host: string): boolean {
  const hostname = host.split(':')[0] ?? '';
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
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
