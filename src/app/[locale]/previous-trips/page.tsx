import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { TripGrid } from '@/components/trips/TripGrid';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { listPastTrips } from '@/modules/trips/trip.service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.previousTrips' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/previous-trips', locale),
    openGraph: { title: t('title'), description: t('description') },
  };
}

/**
 * Completed trips are presented as travel memories, not as unavailable products —
 * they exist to build trust and to show what a trip with the company is like.
 * CLAUDE.md / plan Phase 6, §18 of the brief.
 */
export default async function PreviousTripsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [trips, t, tNav] = await Promise.all([
    listPastTrips(48),
    getTranslations({ locale, namespace: 'previousTrips' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={tNav('previousTrips')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <Container className="py-14">
        {trips.length > 0 ? (
          <TripGrid trips={trips} locale={locale} prioritiseFirst />
        ) : (
          <EmptyState
            icon="image"
            title={t('empty.title')}
            body={t('empty.body')}
            action={
              <Button as={Link} href="/trips" variant="outline">
                {tNav('trips')}
              </Button>
            }
          />
        )}
      </Container>
    </>
  );
}
