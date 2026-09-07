'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import {
  TRIP_FILTERS,
  type TripFilter,
} from './trip-filters.constants';
/**
 * Filters as links rather than buttons.
 *
 * The filter is part of the URL, so a filtered listing can be shared, bookmarked
 * and reached by the back button — and it keeps working without JavaScript.
 */
export function TripFilters({ active }: { active: TripFilter }) {
  const t = useTranslations('trips.filters');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (filter: TripFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') params.delete('filter');
    else params.set('filter', filter);
    params.delete('page');

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav aria-label={t('label')} className="u-scroll-x -mx-1 flex gap-2 px-1 pb-1">
      {TRIP_FILTERS.map((filter) => {
        const isActive = filter === active;

        return (
          <Link
            key={filter}
            href={hrefFor(filter)}
            scroll={false}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-md border px-4 py-2 text-body-sm font-semibold transition-colors duration-150',
              isActive
                ? 'border-navy bg-navy text-cream'
                : 'border-sand bg-surface text-ink-soft hover:border-gold/60 hover:text-navy',
            )}
          >
            {t(filter)}
          </Link>
        );
      })}
    </nav>
  );
}
