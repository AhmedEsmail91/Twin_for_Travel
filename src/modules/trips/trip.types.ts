import type { Localized, LocalizedList } from '@/types/common';

/**
 * Trip lifecycle.
 *
 * `UPCOMING`, `ONGOING` and `COMPLETED` are *derived* from the trip's dates so staff
 * never have to move trips between "past" and "upcoming" by hand. `DRAFT` and
 * `CANCELLED` are explicit administrative states and always win over the derived
 * value. See CLAUDE.md §23.6.
 */
export const TRIP_STATUSES = ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

/** Statuses the admin sets directly; the rest follow from the dates. */
export const MANUAL_TRIP_STATUSES = ['DRAFT', 'CANCELLED'] as const;

export const CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED'] as const;
export type Currency = (typeof CURRENCIES)[number];

export type TripImage = {
  url: string;
  /** Provider-specific handle, used to delete the original when the trip changes. */
  storageKey: string;
  alt: Localized;
  width: number;
  height: number;
};

export type Trip = {
  id: string;

  title: Localized;
  slug: string;
  shortDescription: Localized;
  description: Localized;

  coverImage: TripImage | null;
  gallery: TripImage[];

  destination: Localized;
  location: Localized;
  meetingPoint: Localized;
  transportation: Localized;

  startDate: string;
  endDate: string;
  reservationStartDate: string | null;
  reservationEndDate: string | null;

  price: number;
  currency: Currency;
  capacity: number;
  availableSeats: number;

  status: TripStatus;
  published: boolean;
  featured: boolean;
  displayOrder: number;

  entertainment: LocalizedList;
  includedServices: LocalizedList;
  excludedServices: LocalizedList;
  importantNotes: LocalizedList;
  reservationInformation: Localized;

  createdAt: string;
  updatedAt: string;
};

/** A trip plus the values the UI derives rather than stores. */
export type TripWithDerived = Trip & {
  effectiveStatus: TripStatus;
  durationDays: number;
  reservationOpen: boolean;
  soldOut: boolean;
};

export type TripListFilters = {
  status?: TripStatus;
  published?: boolean;
  featured?: boolean;
  search?: string;
  /** Public listings pass this; the admin listing does not. */
  timeframe?: 'upcoming' | 'past';
};

export type TripSortField = 'startDate' | 'createdAt' | 'displayOrder' | 'price';

export type TripListOptions = TripListFilters & {
  page?: number;
  pageSize?: number;
  sortBy?: TripSortField;
  sortDirection?: 'asc' | 'desc';
};
