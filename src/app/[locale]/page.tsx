import { setRequestLocale } from 'next-intl/server';

import { ContactCta } from '@/components/home/ContactCta';
import { GalleryStrip } from '@/components/home/GalleryStrip';
import { Hero } from '@/components/home/Hero';
import { TripSection } from '@/components/home/TripSection';
import { WhyUs } from '@/components/home/WhyUs';
import { TravelAgencyJsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/i18n/routing';
import { getSiteSettings } from '@/modules/settings/settings.service';
import { listFeaturedTrips, listPastTrips, listUpcomingTrips } from '@/modules/trips/trip.service';
import { getTranslations } from 'next-intl/server';

/*
 * Rendered per request. The content is admin-editable and must appear the moment it
 * is saved, and the reads are memoised within a render, so there is nothing to gain
 * from a stale revalidation window. CLAUDE.md §23.7.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, featured, upcoming, past, t] = await Promise.all([
    getSiteSettings(),
    listFeaturedTrips(3),
    listUpcomingTrips(6),
    listPastTrips(3),
    getTranslations({ locale, namespace: 'home' }),
  ]);

  // The hero borrows its backdrop from whichever trip is being promoted.
  const backdropTrip = featured[0] ?? upcoming[0] ?? past[0];

  return (
    <>
      <TravelAgencyJsonLd locale={locale} settings={settings} />

      <Hero locale={locale} settings={settings} backdropTrip={backdropTrip} />

      {featured.length > 0 ? (
        <TripSection
          locale={locale}
          trips={featured}
          namespace="home.featured"
          href="/trips"
          prioritiseImages
        />
      ) : null}

      <TripSection
        locale={locale}
        trips={upcoming}
        namespace="home.upcoming"
        href="/trips"
        tone={featured.length > 0 ? 'warm' : 'light'}
        emptyMessage={t('upcoming.empty')}
        prioritiseImages={featured.length === 0}
      />

      <WhyUs locale={locale} />

      {past.length > 0 ? (
        <TripSection
          locale={locale}
          trips={past}
          namespace="home.previous"
          href="/previous-trips"
        />
      ) : null}

      <GalleryStrip locale={locale} trips={[...upcoming, ...past]} />

      <ContactCta locale={locale} settings={settings} />
    </>
  );
}
