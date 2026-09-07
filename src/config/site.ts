/**
 * Static, non-business configuration.
 *
 * Anything the company might want to change without a deploy — WhatsApp number,
 * social URLs, contact details, company name — belongs in `SiteSettings` in the
 * database, not here. See CLAUDE.md §43.
 *
 * Safe to import from Client Components: it contains no secrets.
 */

export const SITE = {
  /** Fallback only. The live value comes from SiteSettings.companyName. */
  name: 'Twin for Travel',
  /** The logo ships as an image asset and is never recreated in CSS. */
  logo: {
    src: '/brand/logo.png',
    /** The supplied badge is square; never distort this ratio. */
    width: 512,
    height: 512,
    aspectRatio: 1,
  },
  ogImage: '/brand/og-image.png',
} as const;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

/** Name of the admin session cookie. Referenced by middleware and the auth module. */
export const SESSION_COOKIE = 'tft_session';

/** How long an admin session stays valid. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
