'use server';

import { cookies } from 'next/headers';

import { ADMIN_LOCALE_COOKIE } from './admin-locale';
import type { Locale } from './routing';

/** Sets the admin dashboard's language cookie. Scoped to `/admin` only. */
export async function setAdminLocale(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 365,
  });
}
