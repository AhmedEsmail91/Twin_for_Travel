import { TripCard } from './TripCard';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';
import type { TripWithDerived } from '@/modules/trips/trip.types';

export function TripGrid({
  trips,
  locale,
  columns = 3,
  prioritiseFirst = false,
}: {
  trips: TripWithDerived[];
  locale: Locale;
  columns?: 2 | 3;
  prioritiseFirst?: boolean;
}) {
  return (
    <ul
      className={cn(
        'grid gap-6 sm:grid-cols-2',
        columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
      )}
    >
      {trips.map((trip, index) => (
        <li key={trip.id} className="flex">
          <div className="flex w-full">
            <TripCard trip={trip} locale={locale} priority={prioritiseFirst && index < 3} />
          </div>
        </li>
      ))}
    </ul>
  );
}
