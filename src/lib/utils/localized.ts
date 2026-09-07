import type { Locale } from '@/i18n/routing';
import type { Localized, LocalizedList } from '@/types/common';

/**
 * Resolves a bilingual field for the current locale.
 *
 * Falls back to the other language when the requested one is empty. A trip whose
 * English description hasn't been written yet should show the Arabic one, not a
 * blank section — the content is the point, the language is the preference.
 */
export function pickLocale(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return '';

  const preferred = value[locale]?.trim();
  if (preferred) return preferred;

  const fallback = locale === 'ar' ? value.en : value.ar;
  return fallback?.trim() ?? '';
}

export function pickLocaleList(
  value: LocalizedList | undefined | null,
  locale: Locale,
): string[] {
  if (!value) return [];

  const preferred = value[locale]?.filter((entry) => entry.trim().length > 0) ?? [];
  if (preferred.length > 0) return preferred;

  const fallback = locale === 'ar' ? value.en : value.ar;
  return fallback?.filter((entry) => entry.trim().length > 0) ?? [];
}

export function emptyLocalized(): Localized {
  return { ar: '', en: '' };
}

export function emptyLocalizedList(): LocalizedList {
  return { ar: [], en: [] };
}

/** True when neither language has content — used to hide empty detail sections. */
export function isLocalizedEmpty(value: Localized | undefined | null): boolean {
  return !value?.ar?.trim() && !value?.en?.trim();
}

export function isLocalizedListEmpty(value: LocalizedList | undefined | null): boolean {
  return (value?.ar?.length ?? 0) === 0 && (value?.en?.length ?? 0) === 0;
}
