import { defineRouting } from 'next-intl/routing';

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

/** Text direction per locale. The locale layout is the only place this is applied. */
export const LOCALE_DIRECTION: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

/** BCP-47 tags used for `Intl` formatting and `hreflang` alternates. */
export const LOCALE_TAG: Record<Locale, string> = {
  ar: 'ar-EG',
  en: 'en-US',
};

export const LOCALE_LABEL: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  /**
   * Always prefix, including the default locale. One canonical URL shape for every
   * page keeps `hreflang`, the sitemap and the locale switcher unambiguous.
   */
  localePrefix: 'always',
  localeDetection: false,
});
