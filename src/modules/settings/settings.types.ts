import type { Localized } from '@/types/common';

/**
 * Everything the business can change without a deploy. Nothing in this shape may be
 * hard-coded in a component. CLAUDE.md §43.
 */
export type SiteSettings = {
  id: string;

  companyName: Localized;
  tagline: Localized;
  about: Localized;

  whatsappNumber: string;
  /** Prefilled WhatsApp text; the trip page appends the trip name. */
  whatsappMessage: Localized;

  contactPhone: string;
  contactEmail: string;
  address: Localized;
  workingHours: Localized;

  /** Optional Google Maps place URL shown on the contact page. */
  mapUrl: string;

  seoTitle: Localized;
  seoDescription: Localized;

  updatedAt: string;
};

/** Rendered before an admin has ever saved settings, so the site is never blank. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  companyName: { ar: 'توين للسياحة', en: 'Twin for Travel' },
  tagline: { ar: 'اكتشف • استكشف • استمتع', en: 'Explore • Discover • Enjoy' },
  about: { ar: '', en: '' },

  whatsappNumber: '',
  whatsappMessage: { ar: '', en: '' },

  contactPhone: '',
  contactEmail: '',
  address: { ar: '', en: '' },
  workingHours: { ar: '', en: '' },
  mapUrl: '',

  seoTitle: { ar: '', en: '' },
  seoDescription: { ar: '', en: '' },

  updatedAt: new Date(0).toISOString(),
};
