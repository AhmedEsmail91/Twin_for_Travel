import { getFormatter, getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { TripStatusBadge } from './TripStatusBadge';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { pickLocale } from '@/lib/utils/localized';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * The repeated card shape from the reference: photograph, a navy scrim carrying the
 * status, then a cream body with title, destination, dates and price.
 *
 * Deliberately restrained — the card's job is to lead to the detail page, so it
 * shows only what a visitor needs to choose between trips. CLAUDE.md §17.
 */
export async function TripCard({
  trip,
  locale,
  priority = false,
}: {
  trip: TripWithDerived;
  locale: Locale;
  priority?: boolean;
}) {
  const [t, format] = await Promise.all([
    getTranslations({ locale, namespace: 'trips.card' }),
    getFormatter({ locale }),
  ]);

  const title = pickLocale(trip.title, locale);
  const destination = pickLocale(trip.destination, locale);
  const summary = pickLocale(trip.shortDescription, locale);
  const coverAlt = trip.coverImage ? pickLocale(trip.coverImage.alt, locale) || title : title;

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const sameDay = trip.durationDays === 1;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-sand bg-surface shadow-card transition-shadow duration-200 hover:shadow-lifted">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunk">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage.url}
            alt={coverAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sand-muted">
            <Icon name="image" size={32} />
          </div>
        )}

        <div aria-hidden className="u-photo-scrim absolute inset-x-0 bottom-0 h-2/5" />

        <div className="absolute top-3 flex items-center gap-2 start-3">
          <TripStatusBadge status={trip.effectiveStatus} onImage />
          {trip.featured ? (
            <span className="flex size-7 items-center justify-center rounded-sm bg-gold text-navy">
              <Icon name="star" size={14} />
              <span className="sr-only">Featured</span>
            </span>
          ) : null}
        </div>

        {destination ? (
          <p className="absolute bottom-3 flex items-center gap-1.5 text-caption font-semibold text-cream start-3 end-3">
            <Icon name="pin" size={15} className="shrink-0 text-gold-light" />
            <span className="truncate">{destination}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-h3 font-display text-navy">
          {/*
            The whole card is clickable via this stretched link, which keeps a single
            focusable target and a real link for keyboard and screen-reader users.
          */}
          <Link
            href={`/trips/${trip.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <span className="u-clamp-2">{title}</span>
          </Link>
        </h3>

        {summary ? <p className="u-clamp-2 mt-2 text-body-sm text-ink-soft">{summary}</p> : null}

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-soft">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t('duration', { count: trip.durationDays })}</dt>
            <Icon name="calendar" size={15} className="text-gold-dark" />
            <dd className="u-numeric">
              {sameDay
                ? format.dateTime(startDate, 'short')
                : `${format.dateTime(startDate, 'dayMonth')} – ${format.dateTime(endDate, 'short')}`}
            </dd>
          </div>

          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t('duration', { count: trip.durationDays })}</dt>
            <Icon name="clock" size={15} className="text-gold-dark" />
            <dd>{t('duration', { count: trip.durationDays })}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-sand pt-4">
          <p>
            <span className="block text-caption text-ink-soft">{t('priceFrom')}</span>
            <span className="u-numeric text-h3 font-bold text-navy">
              {format.number(trip.price, { style: 'currency', currency: trip.currency, maximumFractionDigits: 0 })}
            </span>
          </p>

          <p
            className={cn(
              'text-caption font-semibold',
              trip.soldOut ? 'text-danger' : 'text-success',
            )}
          >
            {trip.soldOut ? t('soldOut') : t('seatsLeft', { count: trip.availableSeats })}
          </p>
        </div>
      </div>
    </article>
  );
}
