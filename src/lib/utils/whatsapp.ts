/**
 * WhatsApp link building.
 *
 * The number always comes from `SiteSettings` (CLAUDE.md §24) — this module only
 * knows how to shape a link, never which number to use.
 */

/** wa.me expects digits only, including the country code and no leading `+` or `00`. */
export function normaliseWhatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('00') ? digits.slice(2) : digits;
}

export function buildWhatsappUrl(number: string, message?: string): string {
  const normalised = normaliseWhatsappNumber(number);
  if (!normalised) return '';

  const url = new URL(`https://wa.me/${normalised}`);
  if (message?.trim()) url.searchParams.set('text', message.trim());
  return url.toString();
}

/** Grouped for display: +20 101 275 2911 */
export function formatPhoneForDisplay(raw: string): string {
  const digits = normaliseWhatsappNumber(raw);
  if (!digits) return raw;

  const match = /^(\d{1,3})(\d{3})(\d{3})(\d{4})$/.exec(digits);
  if (!match) return `+${digits}`;

  return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}
