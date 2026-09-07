import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { TripGrid } from '@/components/trips/TripGrid';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * One section component for the featured, upcoming and previous rails.
 *
 * They differ only in copy, background and link target, so three near-identical
 * components would be duplication rather than clarity. CLAUDE.md §14.
 */
export async function TripSection({
  locale,
  trips,
  namespace,
  href,
  tone = 'light',
  emptyMessage,
  prioritiseImages = false,
  children,
}: {
  locale: Locale;
  trips: TripWithDerived[];
  namespace: 'home.featured' | 'home.upcoming' | 'home.previous';
  href: string;
  tone?: 'light' | 'warm';
  emptyMessage?: string;
  prioritiseImages?: boolean;
  children?: ReactNode;
}) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <section className={cn('py-18', tone === 'warm' ? 'bg-surface-sunk' : 'bg-page')}>
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          action={
            trips.length > 0 ? (
              <Button as={Link} href={href} variant="outline" size="sm">
                {tCommon('viewAll')}
                <Icon name="arrow" size={16} flipRtl />
              </Button>
            ) : null
          }
        />

        <div className="mt-10">
          {trips.length > 0 ? (
            <TripGrid trips={trips} locale={locale} prioritiseFirst={prioritiseImages} />
          ) : (
            <EmptyState icon="plane" title={emptyMessage ?? ''} />
          )}
        </div>

        {children}
      </Container>
    </section>
  );
}
