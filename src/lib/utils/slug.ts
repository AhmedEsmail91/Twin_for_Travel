/**
 * Slug generation.
 *
 * One Latin, kebab-case slug per trip, shared by both locales (CLAUDE.md §10).
 * Arabic titles are transliterated so an Arabic-only trip still produces a
 * readable, typeable URL rather than percent-encoded bytes.
 */

const ARABIC_TRANSLITERATION: Record<string, string> = {
  ا: 'a', أ: 'a', إ: 'i', آ: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'g', ح: 'h',
  خ: 'kh', د: 'd', ذ: 'th', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd',
  ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm',
  ن: 'n', ه: 'h', ة: 'a', و: 'w', ؤ: 'w', ي: 'y', ئ: 'y', ى: 'a', ء: '',
  // Arabic-Indic digits
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/** Diacritics (harakat) carry no information in a URL. */
const ARABIC_DIACRITICS = /[ً-ْٰـ]/g;

export function slugify(input: string): string {
  const transliterated = input
    .normalize('NFKD')
    .replace(ARABIC_DIACRITICS, '')
    .split('')
    .map((char) => ARABIC_TRANSLITERATION[char] ?? char)
    .join('');

  return transliterated
    .toLowerCase()
    // Strip combining marks left by NFKD on Latin text (é → e).
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * Builds a slug from whichever title is available, preferring English because it
 * needs no transliteration.
 */
export function slugFromTitle(title: { ar?: string; en?: string }): string {
  const fromEnglish = title.en ? slugify(title.en) : '';
  if (fromEnglish) return fromEnglish;

  const fromArabic = title.ar ? slugify(title.ar) : '';
  return fromArabic;
}

/** Appends `-2`, `-3`, … when a slug is taken. */
export function nextSlugCandidate(base: string, attempt: number): string {
  return attempt <= 1 ? base : `${base}-${attempt}`;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
