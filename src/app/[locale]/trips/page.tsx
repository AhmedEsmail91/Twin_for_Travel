import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { TripFilters } from '@/components/trips/TripFilters';
import {
  TRIP_FILTERS,
  type TripFilter,
} from '@/components/trips/trip-filters.constants';

import { TripGrid } from '@/components/trips/TripGrid';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { TripCardSkeleton } from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { listPublishedTrips } from '@/modules/trips/trip.service';
import type { TripListOptions } from '@/modules/trips/trip.types';

export const dynamic = 'force-dynamic';

type TripsPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ filter?: string }>;
};

export async function generateMetadata({ params }: TripsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.trips' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/trips', locale),
    openGraph: { title: t('title'), description: t('description'), url: `/${locale}/trips` },
  };
}

/** Maps a URL filter onto the service's query options. */
function optionsForFilter(filter: TripFilter): Omit<TripListOptions, 'published'> {
  switch (filter) {
    case 'upcoming':
      return { timeframe: 'upcoming', sortBy: 'startDate', sortDirection: 'asc', pageSize: 60 };
    case 'ongoing':
      return { status: 'ONGOING', sortBy: 'startDate', sortDirection: 'asc', pageSize: 60 };
    case 'completed':
      return { timeframe: 'past', sortBy: 'startDate', sortDirection: 'desc', pageSize: 60 };
    default:
      return { sortBy: 'startDate', sortDirection: 'desc', pageSize: 60 };
  }
}

function isTripFilter(value: string | undefined): value is TripFilter {
  console.log('TRIP_FILTERS:', TRIP_FILTERS);
  console.log('typeof:', typeof TRIP_FILTERS);
  console.log('isArray:', Array.isArray(TRIP_FILTERS));
  console.log('includes:', typeof TRIP_FILTERS?.includes);
  return value !== undefined && (TRIP_FILTERS as readonly string[]).includes(value);
}

export default async function TripsPage({ params, searchParams }: TripsPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const filter: TripFilter = isTripFilter(query.filter) ? query.filter : 'all';
  const t = await getTranslations({ locale, namespace: 'trips' });

  return (
    <>
      <PageHeader eyebrow={t('filters.label')} title={t('title')} subtitle={t('subtitle')} />

      <Container className="py-12">
        <TripFilters active={filter} />

        <div className="mt-8">
          <Suspense key={filter} fallback={<TripsLoading />}>
            <TripResults locale={locale} filter={filter} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

/** Split out so the filter chips paint immediately while the query runs. */
async function TripResults({ locale, filter }: { locale: Locale; filter: TripFilter }) {
  const [trips, t, tNav] = await Promise.all([
    listPublishedTrips(optionsForFilter(filter)),
    getTranslations({ locale, namespace: 'trips.empty' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  if (trips.length === 0) {
    return (
      <EmptyState
        icon="plane"
        title={t('title')}
        body={t('body')}
        action={
          <Button as={Link} href="/contact" variant="outline">
            {tNav('contact')}
          </Button>
        }
      />
    );
  }

  return <TripGrid trips={trips} locale={locale} prioritiseFirst headingLevel={2} />;
}

function TripsLoading() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <TripCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
