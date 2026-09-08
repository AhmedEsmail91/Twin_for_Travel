import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { AdminPage } from '@/components/admin/AdminPage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { getAdminLocale } from '@/i18n/admin-locale';
import { requireAdmin } from '@/modules/auth/auth.service';
import { getTripCounts, listUpcomingTrips } from '@/modules/trips/trip.service';

export const dynamic = 'force-dynamic';

/**
 * Summary cards only where the number means something operationally. No invented
 * analytics to fill space (CLAUDE.md / brief §24).
 */
const CARD_KEYS: { countKey: string; messageKey: string; icon: IconName }[] = [
  { countKey: 'total', messageKey: 'total', icon: 'plane' },
  { countKey: 'UPCOMING', messageKey: 'upcoming', icon: 'calendar' },
  { countKey: 'COMPLETED', messageKey: 'completed', icon: 'check' },
  { countKey: 'DRAFT', messageKey: 'draft', icon: 'image' },
  { countKey: 'featured', messageKey: 'featured', icon: 'star' },
  { countKey: 'published', messageKey: 'published', icon: 'globe' },
];

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const locale = await getAdminLocale();
  const [t, counts, upcoming] = await Promise.all([
    getTranslations({ locale, namespace: 'admin.overview' }),
    getTripCounts(),
    listUpcomingTrips(5),
  ]);

  return (
    <AdminPage
      title={t('welcomeBack', { name: (admin.name || admin.email).split(' ')[0] ?? '' })}
      description={t('snapshot')}
      action={
        <Button as={Link} href="/admin/trips/create" variant="primary">
          <Icon name="plus" size={17} />
          {t('newTrip')}
        </Button>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_KEYS.map((card) => (
          <li
            key={card.countKey}
            className="rounded-lg border border-sand bg-surface p-5 shadow-hairline"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-ink-soft">
                  {t(`cards.${card.messageKey}.label`)}
                </p>
                <p className="u-numeric mt-1 text-h2 font-bold text-navy">
                  {counts[card.countKey] ?? 0}
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-dark">
                <Icon name={card.icon} size={19} />
              </span>
            </div>
            <p className="mt-3 text-caption text-ink-soft">{t(`cards.${card.messageKey}.hint`)}</p>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-h3 font-bold text-navy">{t('nextDepartures')}</h2>
          <Link
            href="/admin/trips"
            className="text-caption font-semibold text-gold-dark hover:underline"
          >
            {t('allTrips')}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={t('empty.title')}
            body={t('empty.body')}
            action={
              <Button as={Link} href="/admin/trips/create" variant="outline">
                {t('empty.action')}
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-sand overflow-hidden rounded-lg border border-sand bg-surface">
            {upcoming.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/admin/trips/${trip.id}/edit`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface-sunk"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-body-sm font-semibold text-navy">
                      {trip.title.en || trip.title.ar}
                    </span>
                    <span className="u-numeric block text-caption text-ink-soft">
                      {new Date(trip.startDate).toISOString().slice(0, 10)} ·{' '}
                      {trip.availableSeats}/{trip.capacity} {t('seats')}
                    </span>
                  </span>
                  <Icon name="arrow" size={17} className="shrink-0 text-sand-muted rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
