import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/config/site';
import { routing } from '@/i18n/routing';

const intlProxy = createMiddleware(routing);

/**
 * Request proxy (formerly `middleware.ts`; Next.js 16 renamed the convention).
 *
 * Two responsibilities, in order:
 *
 * 1. `/admin/*` — redirect to the login page when no session cookie is present.
 *    This is a fast path only. It checks for the *presence* of a cookie, not its
 *    validity: the signature is verified server-side by `requireAdmin()` in every
 *    admin page and every admin route handler. Middleware is never the authority.
 *    See CLAUDE.md §9.
 *
 * 2. Everything else — locale routing. `/` redirects to `/ar`.
 */
export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname === '/admin/login') return NextResponse.next();

    if (!request.cookies.get(SESSION_COOKIE)?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return intlProxy(request);
}

export const config = {
  /*
   * Run on application routes only. Excludes API routes (they authenticate
   * themselves), Next.js internals, and any path containing a dot (static files).
   */
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
