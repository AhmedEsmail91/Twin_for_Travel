import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { TouristTripJsonLd } from '@/components/seo/JsonLd';
import { TripContentSection, TripList, TripProse } from '@/components/trips/TripContentSection';
import { TripGallery } from '@/components/trips/TripGallery';
import { TripGrid } from '@/components/trips/TripGrid';
import { TripSidebar } from '@/components/trips/TripSidebar';
import { TripStatusBadge } from '@/components/trips/TripStatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { isLocalizedEmpty, pickLocale, pickLocaleList } from '@/lib/utils/localized';
import { getSiteSettings } from '@/modules/settings/settings.service';
import { getPublishedTripBySlug, listUpcomingTrips } from '@/modules/trips/trip.service';

export const dynamic = 'force-dynamic';

type TripPageProps = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const trip = await getPublishedTripBySlug(slug);

  if (!trip) {
    const t = await getTranslations({ locale, namespace: 'errors.tripNotFound' });
    return { title: t('title'), robots: { index: false, follow: false } };
  }

  const title = pickLocale(trip.title, locale);
  const description =
    pickLocale(trip.shortDescription, locale) ||
    pickLocale(trip.description, locale).slice(0, 200) ||
    pickLocale(trip.destination, locale);

  return {
    title,
    description,
    alternates: buildAlternates(`/trips/${trip.slug}`, locale),
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/${locale}/trips/${trip.slug}`,
      images: trip.coverImage
        ? [{ url: trip.coverImage.url, width: trip.coverImage.width, height: trip.coverImage.height, alt: title }]
        : undefined,
    },
  };
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const trip = await getPublishedTripBySlug(slug);
  if (!trip) notFound();

  const [settings, t, tCommon, format] = await Promise.all([
    getSiteSettings(),
    getTranslations({ locale, namespace: 'tripDetail' }),
    getTranslations({ locale, namespace: 'common' }),
    getFormatter({ locale }),
  ]);

  const title = pickLocale(trip.title, locale);
  const destination = pickLocale(trip.destination, locale);
  const location = pickLocale(trip.location, locale);
  const description = pickLocale(trip.description, locale);
  const summary = pickLocale(trip.shortDescription, locale);
  const companyName = pickLocale(settings.companyName, locale);

  const entertainment = pickLocaleList(trip.entertainment, locale);
  const included = pickLocaleList(trip.includedServices, locale);
  const excluded = pickLocaleList(trip.excludedServices, locale);
  const notes = pickLocaleList(trip.importantNotes, locale);

  // Related trips exclude this one; the rail is hidden when nothing else is live.
  const related = (await listUpcomingTrips(4)).filter((entry) => entry.id !== trip.id).slice(0, 3);

  return (
    <>
      <TouristTripJsonLd trip={trip} locale={locale} companyName={companyName} />

      <section className="relative isolate overflow-hidden bg-navy">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage.url}
            alt={pickLocale(trip.coverImage.alt, locale) || title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
        ) : null}

        <div aria-hidden className="u-photo-scrim absolute inset-0" />

        <Container className="relative">
          <div className="flex max-w-3xl flex-col py-16 sm:py-24">
            <Link
              href="/trips"
              className="mb-6 inline-flex w-fit items-center gap-2 text-caption font-semibold text-cream/75 transition-colors duration-150 hover:text-gold-light"
            >
              <Icon name="arrow" size={16} flipRtl className="rotate-180" />
              {tCommon('backToTrips')}
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <TripStatusBadge status={trip.effectiveStatus} onImage />
            </div>

            <h1 className="text-h1 font-display text-cream">{title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-cream/80">
              {destination ? (
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" size={17} className="text-gold-light" />
                  {destination}
                  {location ? <span className="text-cream/55">— {location}</span> : null}
                </span>
              ) : null}

              <span className="flex items-center gap-1.5">
                <Icon name="calendar" size={17} className="text-gold-light" />
                <span className="u-numeric">
                  {format.dateTime(new Date(trip.startDate), 'long')}
                </span>
              </span>
            </div>

            {summary ? <p className="mt-5 max-w-2xl text-body text-cream/80">{summary}</p> : null}
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">
            {trip.effectiveStatus === 'COMPLETED' ? (
              <Alert tone="info">{t('completedNotice')}</Alert>
            ) : null}

            {trip.effectiveStatus === 'CANCELLED' ? (
              <Alert tone="warning">{t('cancelledNotice')}</Alert>
            ) : null}

            {description ? (
              <section>
                <h2 className="mb-4 text-h3 font-display text-navy">{t('overview')}</h2>
                <TripProse text={description} />
              </section>
            ) : null}

            {trip.gallery.length > 0 ? (
              <TripContentSection icon="image" title={t('gallery')}>
                <TripGallery images={trip.gallery} locale={locale} tripTitle={title} />
              </TripContentSection>
            ) : null}

            {entertainment.length > 0 ? (
              <TripContentSection icon="sparkles" title={t('entertainment')}>
                <TripList items={entertainment} />
              </TripContentSection>
            ) : null}

            {included.length > 0 ? (
              <TripContentSection icon="check" title={t('included')}>
                <TripList items={included} variant="included" />
              </TripContentSection>
            ) : null}

            {excluded.length > 0 ? (
              <TripContentSection icon="cross" title={t('excluded')}>
                <TripList items={excluded} variant="excluded" />
              </TripContentSection>
            ) : null}

            {!isLocalizedEmpty(trip.transportation) ? (
              <TripContentSection icon="car" title={t('transportation')}>
                <TripProse text={pickLocale(trip.transportation, locale)} />
              </TripContentSection>
            ) : null}

            {!isLocalizedEmpty(trip.meetingPoint) ? (
              <TripContentSection icon="pin" title={t('meetingPoint')}>
                <TripProse text={pickLocale(trip.meetingPoint, locale)} />
              </TripContentSection>
            ) : null}

            {notes.length > 0 ? (
              <TripContentSection icon="info" title={t('notes')}>
                <TripList items={notes} />
              </TripContentSection>
            ) : null}

            {!isLocalizedEmpty(trip.reservationInformation) ? (
              <TripContentSection icon="wallet" title={t('reservation')}>
                <TripProse text={pickLocale(trip.reservationInformation, locale)} />
              </TripContentSection>
            ) : null}
          </div>

          <TripSidebar trip={trip} locale={locale} settings={settings} />
        </div>
      </Container>

      {related.length > 0 ? (
        <section className="border-t border-sand bg-surface-sunk py-16">
          <Container>
            <SectionHeading title={t('relatedTitle')} />
            <div className="mt-8">
              <TripGrid trips={related} locale={locale} />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
