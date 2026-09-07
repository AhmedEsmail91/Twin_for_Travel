import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * Photographs pulled from the galleries of published trips.
 *
 * The section renders nothing at all when there are no images — an empty state here
 * would be noise, since the rails above already explain that no trips exist yet.
 */
export async function GalleryStrip({
  locale,
  trips,
}: {
  locale: Locale;
  trips: TripWithDerived[];
}) {
  const t = await getTranslations({ locale, namespace: 'home.gallery' });

  const photos = trips
    .flatMap((trip) =>
      trip.gallery.map((image) => ({
        image,
        slug: trip.slug,
        tripTitle: pickLocale(trip.title, locale),
      })),
    )
    .slice(0, 8);

  if (photos.length === 0) return null;

  return (
    <section className="bg-page py-18">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          align="center"
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map(({ image, slug, tripTitle }, index) => (
            <li
              key={`${slug}-${image.storageKey}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-md border border-sand bg-surface-sunk"
            >
              <Link href={`/trips/${slug}`} className="block h-full w-full">
                <Image
                  src={image.url}
                  alt={pickLocale(image.alt, locale) || tripTitle}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="u-photo-scrim absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
                <span className="absolute bottom-2 truncate text-caption font-semibold text-cream opacity-0 transition-opacity duration-200 group-hover:opacity-100 start-2 end-2">
                  {tripTitle}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
