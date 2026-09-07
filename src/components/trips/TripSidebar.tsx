import { getFormatter, getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import { buildWhatsappUrl } from '@/lib/utils/whatsapp';
import type { SiteSettings } from '@/modules/settings/settings.types';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * The reservation panel: price, dates, availability and the WhatsApp hand-off.
 *
 * There is no online payment and no booking engine — the CTA opens a conversation
 * with the company, pre-filled with the trip name. The number comes from
 * SiteSettings, so it is configurable and appears in exactly one place. CLAUDE.md §20.
 */
export async function TripSidebar({
  trip,
  locale,
  settings,
}: {
  trip: TripWithDerived;
  locale: Locale;
  settings: SiteSettings;
}) {
  const [t, tCard, format] = await Promise.all([
    getTranslations({ locale, namespace: 'tripDetail' }),
    getTranslations({ locale, namespace: 'trips.card' }),
    getFormatter({ locale }),
  ]);

  const title = pickLocale(trip.title, locale);
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsappUrl(settings.whatsappNumber, t('whatsappMessage', { trip: title }))
    : '';

  /*
   * `reservationState` is computed in the service against the company's timezone.
   * Reading the clock here instead would make this component impure — it could
   * render one thing on the server and another on a client re-render.
   */
  const reservationNote = ((): { text: string; tone: 'open' | 'closed' } | null => {
    switch (trip.reservationState) {
      case 'not-yet-open':
        return trip.reservationStartDate
          ? {
              text: t('reservationOpensOn', {
                date: format.dateTime(new Date(trip.reservationStartDate), 'long'),
              }),
              tone: 'closed',
            }
          : null;

      case 'open':
        return trip.reservationEndDate
          ? {
              text: t('reservationOpen', {
                date: format.dateTime(new Date(trip.reservationEndDate), 'long'),
              }),
              tone: 'open',
            }
          : null;

      case 'closed':
        return { text: t('reservationClosed'), tone: 'closed' };

      default:
        return null;
    }
  })();

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-lg border border-gold/35 bg-surface shadow-card u-gold-frame">
        <div className="border-b border-sand bg-surface-sunk px-5 py-4">
          <p className="text-caption text-ink-soft">{t('price')}</p>
          <p className="u-numeric mt-1 text-h2 font-bold text-navy">
            {format.number(trip.price, {
              style: 'currency',
              currency: trip.currency,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        <dl className="divide-y divide-sand">
          <Row icon="calendar" label={t('startDate')}>
            <span className="u-numeric">{format.dateTime(new Date(trip.startDate), 'long')}</span>
          </Row>

          <Row icon="calendar" label={t('endDate')}>
            <span className="u-numeric">{format.dateTime(new Date(trip.endDate), 'long')}</span>
          </Row>

          <Row icon="clock" label={t('duration')}>
            {tCard('duration', { count: trip.durationDays })}
          </Row>

          <Row icon="users" label={t('availability')}>
            <span className="u-numeric">
              {t('seatsAvailable', { available: trip.availableSeats, capacity: trip.capacity })}
            </span>
          </Row>
        </dl>

        {reservationNote ? (
          <p
            className={
              reservationNote.tone === 'open'
                ? 'border-t border-sand bg-success/8 px-5 py-3 text-caption font-semibold text-success'
                : 'border-t border-sand bg-warning/8 px-5 py-3 text-caption font-semibold text-warning'
            }
          >
            {reservationNote.text}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-sand p-4">
          {whatsappUrl ? (
            <Button
              as="a"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="gold"
              fullWidth
            >
              <Icon name="whatsapp" size={19} />
              {t('bookViaWhatsapp')}
            </Button>
          ) : null}

          {settings.contactPhone ? (
            <Button
              as="a"
              href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
              variant="outline"
              fullWidth
            >
              <Icon name="phone" size={17} />
              {t('contactUs')}
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: 'calendar' | 'clock' | 'users';
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="flex items-center gap-2 text-caption text-ink-soft">
        <Icon name={icon} size={16} className="text-gold-dark" />
        {label}
      </dt>
      <dd className="text-body-sm font-semibold text-navy">{children}</dd>
    </div>
  );
}
