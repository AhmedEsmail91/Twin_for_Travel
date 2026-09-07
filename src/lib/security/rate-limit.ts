import 'server-only';

/**
 * Fixed-window, in-memory rate limiter.
 *
 * Deliberately simple: it protects the login endpoint from credential stuffing on a
 * single instance. It is *per process* — behind several instances each gets its own
 * budget. That is an accepted trade-off for a small admin surface; if the deployment
 * ever scales horizontally, swap the map for Redis behind this same function
 * signature and nothing above it changes.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Bound the map so a flood of distinct keys cannot grow it without limit. */
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) evictExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

/** Called after a successful login so a legitimate user isn't punished for typos. */
export function resetRateLimit(key: string): void {
  windows.delete(key);
}

function evictExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Best-effort client IP. Behind a proxy the first `x-forwarded-for` entry is the
 * client; direct connections fall back to a constant, which simply means the limit
 * applies globally rather than per address.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
