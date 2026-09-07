import type { Metadata } from 'next';

import { LOCALES, routing, type Locale } from '@/i18n/routing';

/**
 * Canonical URL plus `hreflang` alternates for a path.
 *
 * Every public page needs both: the canonical so the two locales aren't treated as
 * duplicates, and the alternates so a search engine can offer the right language.
 * `x-default` points at Arabic, the default locale. CLAUDE.md §35.
 */
export function buildAlternates(path: string, locale: Locale): Metadata['alternates'] {
  const normalised = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

  const languages = Object.fromEntries([
    ...LOCALES.map((entry) => [entry, `/${entry}${normalised}`]),
    ['x-default', `/${routing.defaultLocale}${normalised}`],
  ]);

  return { canonical: `/${locale}${normalised}`, languages };
}
