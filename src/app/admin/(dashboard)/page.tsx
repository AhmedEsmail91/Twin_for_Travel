import Link from 'next/link';

import { AdminPage } from '@/components/admin/AdminPage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { requireAdmin } from '@/modules/auth/auth.service';
import { getTripCounts, listUpcomingTrips } from '@/modules/trips/trip.service';

export const dynamic = 'force-dynamic';

/**
 * Summary cards only where the number means something operationally. No invented
 * analytics to fill space (CLAUDE.md / brief §24).
 */
const CARDS: { key: string; label: string; icon: IconName; hint: string }[] = [
  { key: 'total', label: 'Total trips', icon: 'plane', hint: 'Every trip in the database' },
  { key: 'UPCOMING', label: 'Upcoming', icon: 'calendar', hint: 'Announced and still to run' },
  { key: 'COMPLETED', label: 'Completed', icon: 'check', hint: 'Finished and archived' },
  { key: 'DRAFT', label: 'Drafts', icon: 'image', hint: 'Not visible to visitors' },
  { key: 'featured', label: 'Featured', icon: 'star', hint: 'Promoted on the homepage' },
  { key: 'published', label: 'Published', icon: 'globe', hint: 'Live on the public site' },
];

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [counts, upcoming] = await Promise.all([getTripCounts(), listUpcomingTrips(5)]);

  return (
    <AdminPage
      title={`Welcome back, ${(admin.name || admin.email).split(' ')[0]}`}
      description="A snapshot of the trips on the public site."
      action={
        <Button as={Link} href="/admin/trips/create" variant="primary">
          <Icon name="plus" size={17} />
          New trip
        </Button>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <li key={card.key} className="rounded-lg border border-sand bg-surface p-5 shadow-hairline">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-ink-soft">{card.label}</p>
                <p className="u-numeric mt-1 text-h2 font-bold text-navy">{counts[card.key] ?? 0}</p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-dark">
                <Icon name={card.icon} size={19} />
              </span>
            </div>
            <p className="mt-3 text-caption text-ink-soft">{card.hint}</p>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-h3 font-bold text-navy">Next departures</h2>
          <Link
            href="/admin/trips"
            className="text-caption font-semibold text-gold-dark hover:underline"
          >
            All trips
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No upcoming trips"
            body="Create a trip and publish it to see it here and on the public site."
            action={
              <Button as={Link} href="/admin/trips/create" variant="outline">
                Create a trip
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
                      {trip.availableSeats}/{trip.capacity} seats
                    </span>
                  </span>
                  <Icon name="arrow" size={17} className="shrink-0 text-sand-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
