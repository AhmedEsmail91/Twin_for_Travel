import { cookies } from 'next/headers';

import { isLocale, type Locale } from './routing';

/**
 * The admin dashboard is not locale-prefixed (CLAUDE.md §10) — staff toggle its
 * language from a cookie instead of a URL segment. Defaults to English: the
 * dashboard was English-only until this toggle existed, so an unset cookie must not
 * silently flip existing sessions to Arabic.
 */
export const ADMIN_LOCALE_COOKIE = 'tft_admin_locale';
export const DEFAULT_ADMIN_LOCALE: Locale = 'en';

export async function getAdminLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : DEFAULT_ADMIN_LOCALE;
}
