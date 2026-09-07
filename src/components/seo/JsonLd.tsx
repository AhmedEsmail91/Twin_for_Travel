import { APP_URL, SITE } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import type { SiteSettings } from '@/modules/settings/settings.types';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * Structured data.
 *
 * `dangerouslySetInnerHTML` is used here and nowhere else in the project, on JSON we
 * build ourselves from our own database values. `<` is escaped so a stray character
 * in admin-entered copy cannot close the script tag. CLAUDE.md §16.
 */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function TravelAgencyJsonLd({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const name = pickLocale(settings.companyName, locale) || SITE.name;

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name,
        description: pickLocale(settings.about, locale) || undefined,
        url: `${APP_URL}/${locale}`,
        logo: `${APP_URL}${SITE.logo.src}`,
        ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
        ...(settings.contactPhone || settings.whatsappNumber
          ? { telephone: settings.contactPhone || settings.whatsappNumber }
          : {}),
        ...(pickLocale(settings.address, locale)
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: pickLocale(settings.address, locale),
                addressCountry: 'EG',
              },
            }
          : {}),
      }}
    />
  );
}

export function TouristTripJsonLd({
  trip,
  locale,
  companyName,
}: {
  trip: TripWithDerived;
  locale: Locale;
  companyName: string;
}) {
  const name = pickLocale(trip.title, locale);

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name,
        description: pickLocale(trip.shortDescription, locale) || pickLocale(trip.description, locale),
        url: `${APP_URL}/${locale}/trips/${trip.slug}`,
        ...(trip.coverImage ? { image: trip.coverImage.url } : {}),
        ...(pickLocale(trip.destination, locale)
          ? {
              itinerary: {
                '@type': 'Place',
                name: pickLocale(trip.destination, locale),
              },
            }
          : {}),
        provider: { '@type': 'TravelAgency', name: companyName },
        offers: {
          '@type': 'Offer',
          price: trip.price,
          priceCurrency: trip.currency,
          availability: trip.soldOut
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
          validFrom: trip.reservationStartDate ?? undefined,
          validThrough: trip.reservationEndDate ?? undefined,
        },
        startDate: trip.startDate,
        endDate: trip.endDate,
      }}
    />
  );
}
