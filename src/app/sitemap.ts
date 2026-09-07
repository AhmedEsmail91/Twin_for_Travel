import type { MetadataRoute } from 'next';

import { APP_URL } from '@/config/site';
import { LOCALES } from '@/i18n/routing';
import { listPublishedTrips } from '@/modules/trips/trip.service';

const STATIC_PATHS = ['', '/trips', '/previous-trips', '/about', '/contact'] as const;

/**
 * Both locales for every page, cross-linked with `hreflang` alternates so a search
 * engine can serve the right language rather than guessing. CLAUDE.md §35.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(LOCALES.map((locale) => [locale, `${APP_URL}/${locale}${path}`])),
  });

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${APP_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.8,
        alternates: alternatesFor(path),
      });
    }
  }

  /*
   * A database outage must not fail the whole sitemap — the static pages are still
   * worth serving, so trips are added on a best-effort basis.
   */
  try {
    const trips = await listPublishedTrips({ pageSize: 500, sortBy: 'startDate', sortDirection: 'desc' });

    for (const trip of trips) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${APP_URL}/${locale}/trips/${trip.slug}`,
          lastModified: new Date(trip.updatedAt),
          changeFrequency: 'weekly',
          priority: trip.featured ? 0.9 : 0.7,
          alternates: alternatesFor(`/trips/${trip.slug}`),
        });
      }
    }
  } catch (error) {
    console.error('[sitemap] could not load trips; serving static entries only', error);
  }

  return entries;
}

export const dynamic = 'force-dynamic';
