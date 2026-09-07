export const TRIP_FILTERS = [
  'all',
  'upcoming',
  'ongoing',
  'completed',
] as const;

export type TripFilter = (typeof TRIP_FILTERS)[number];