import 'server-only';

import { cache } from 'react';

import { env } from '@/config/env';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/http/errors';
import { durationInDays, startOfDayInZone } from '@/lib/utils/dates';
import { nextSlugCandidate, slugFromTitle, slugify } from '@/lib/utils/slug';
import type { TripDocument } from './trip.model';
import * as repository from './trip.repository';
import type { CreateTripInput, UpdateTripInput } from './trip.schema';
import type {
  ReservationState,
  Trip,
  TripListOptions,
  TripStatus,
  TripWithDerived,
} from './trip.types';
import type { Paginated } from '@/types/common';

/**
 * Trip business rules. Knows nothing about HTTP — it throws `AppError`s and returns
 * domain objects. Both the admin API and the public Server Components call it.
 */

const MAX_SLUG_ATTEMPTS = 50;

/* ------------------------------------------------------------------------- *
 * Derived values
 * ------------------------------------------------------------------------- */

/**
 * The status a visitor should see.
 *
 * `DRAFT` and `CANCELLED` are administrative decisions and always win. Everything
 * else follows from the dates, so nobody has to remember to move a trip from
 * "upcoming" to "completed" the morning after it ends. CLAUDE.md §23.6.
 */
export function deriveStatus(trip: Pick<Trip, 'status' | 'startDate' | 'endDate'>): TripStatus {
  if (trip.status === 'DRAFT' || trip.status === 'CANCELLED') return trip.status;

  const zone = env.SITE_TIMEZONE;
  const today = startOfDayInZone(new Date(), zone).getTime();
  const start = startOfDayInZone(new Date(trip.startDate), zone).getTime();
  const end = startOfDayInZone(new Date(trip.endDate), zone).getTime();

  if (today < start) return 'UPCOMING';
  if (today > end) return 'COMPLETED';
  return 'ONGOING';
}

/**
 * Where "today" sits relative to the configured reservation window, in the
 * company's timezone. Returns `none` when no window is set, so the UI knows to say
 * nothing rather than to guess.
 */
function reservationState(trip: Trip, effectiveStatus: TripStatus): ReservationState {
  if (effectiveStatus === 'COMPLETED' || effectiveStatus === 'CANCELLED') return 'none';
  if (!trip.reservationStartDate && !trip.reservationEndDate) return 'none';

  const zone = env.SITE_TIMEZONE;
  const today = startOfDayInZone(new Date(), zone).getTime();

  if (trip.reservationStartDate) {
    const opens = startOfDayInZone(new Date(trip.reservationStartDate), zone).getTime();
    if (today < opens) return 'not-yet-open';
  }

  if (trip.reservationEndDate) {
    const closes = startOfDayInZone(new Date(trip.reservationEndDate), zone).getTime();
    if (today > closes) return 'closed';
  }

  return 'open';
}

function isReservationOpen(trip: Trip, effectiveStatus: TripStatus, state: ReservationState): boolean {
  if (!trip.published) return false;
  if (effectiveStatus === 'COMPLETED' || effectiveStatus === 'CANCELLED') return false;
  if (trip.availableSeats <= 0) return false;

  return state === 'open' || state === 'none';
}

export function withDerived(trip: Trip): TripWithDerived {
  const effectiveStatus = deriveStatus(trip);
  const state = reservationState(trip, effectiveStatus);

  return {
    ...trip,
    effectiveStatus,
    durationDays: durationInDays(new Date(trip.startDate), new Date(trip.endDate), env.SITE_TIMEZONE),
    reservationOpen: isReservationOpen(trip, effectiveStatus, state),
    reservationState: state,
    soldOut: trip.availableSeats <= 0,
  };
}

/* ------------------------------------------------------------------------- *
 * Reads
 * ------------------------------------------------------------------------- */

export async function listTrips(options: TripListOptions): Promise<Paginated<TripWithDerived>> {
  const result = await repository.findTrips(options);
  return { ...result, items: result.items.map(withDerived) };
}

/**
 * Request-level memoisation. A page that renders the header, a trip card grid and a
 * JSON-LD block from the same query hits the database once. CLAUDE.md §23.7.
 */
export const getPublishedTripBySlug = cache(async (slug: string): Promise<TripWithDerived | null> => {
  const trip = await repository.findTripBySlug(slugify(slug));
  if (!trip || !trip.published || trip.status === 'DRAFT') return null;
  return withDerived(trip);
});

export async function getTripByIdOrThrow(id: string): Promise<TripWithDerived> {
  const trip = await repository.findTripById(id);
  if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
  return withDerived(trip);
}

export const listPublishedTrips = cache(
  async (options: Omit<TripListOptions, 'published'>): Promise<TripWithDerived[]> => {
    const result = await listTrips({ ...options, published: true });
    // Drafts are never published, but guard the public path explicitly.
    return result.items.filter((trip) => trip.effectiveStatus !== 'DRAFT');
  },
);

export const listUpcomingTrips = cache(async (limit = 6): Promise<TripWithDerived[]> =>
  listPublishedTrips({
    timeframe: 'upcoming',
    sortBy: 'startDate',
    sortDirection: 'asc',
    pageSize: limit,
  }),
);

export const listPastTrips = cache(async (limit = 6): Promise<TripWithDerived[]> =>
  listPublishedTrips({
    timeframe: 'past',
    sortBy: 'startDate',
    sortDirection: 'desc',
    pageSize: limit,
  }),
);

export const listFeaturedTrips = cache(async (limit = 3): Promise<TripWithDerived[]> =>
  listPublishedTrips({
    featured: true,
    sortBy: 'displayOrder',
    sortDirection: 'asc',
    pageSize: limit,
  }),
);

export async function getTripCounts(): Promise<Record<string, number>> {
  return repository.countTripsByStatus();
}

/* ------------------------------------------------------------------------- *
 * Writes
 * ------------------------------------------------------------------------- */

export async function createTrip(input: CreateTripInput): Promise<TripWithDerived> {
  const published = resolvePublishState(input.status, input.published, false);
  const slug = await resolveSlug(input.slug ?? slugFromTitle(input.title));
  const data = toDocument(input);

  const trip = await repository.insertTrip({
    ...data,
    slug,
    published,
    status: normaliseStatus(input.status, input.startDate, input.endDate, published),
  });

  return withDerived(trip);
}

export async function updateTrip(id: string, input: UpdateTripInput): Promise<TripWithDerived> {
  const existing = await repository.findTripById(id);
  if (!existing) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');

  /*
   * The schema can only see the request, so publishing is re-checked here against
   * the trip as it will be after the merge — an update that sets `published: true`
   * without touching the cover is valid when one is already stored.
   */
  const willBePublished = resolvePublishState(input.status, input.published, existing.published);
  const willHaveCover =
    input.coverImage !== undefined ? input.coverImage !== null : existing.coverImage !== null;

  if (willBePublished && !willHaveCover) {
    // A specific message, not the generic one: this is often hit from the trips
    // table, where there is no field to attach an inline error to.
    throw new ValidationError('Add a cover image before publishing this trip', {
      coverImage: ['Add a cover image before publishing this trip'],
    });
  }

  const data = toDocument(input);

  // `resolvePublishState` may unpublish in response to a DRAFT status, so the flag
  // is written from the resolved value rather than straight from the request.
  if (willBePublished !== existing.published) data.published = willBePublished;

  if (input.slug !== undefined) {
    const candidate = slugify(input.slug);
    if (candidate !== existing.slug) {
      if (await repository.slugExists(candidate, id)) {
        throw new ConflictError('Another trip already uses this slug', 'SLUG_TAKEN');
      }
      data.slug = candidate;
    }
  }

  /*
   * Re-derive whenever anything the status depends on moves — the status itself, the
   * dates, or the published flag. Otherwise a trip published from a draft, or one
   * whose dates were pushed back, would keep a stale stored status.
   */
  if (
    input.status !== undefined ||
    input.startDate !== undefined ||
    input.endDate !== undefined ||
    input.published !== undefined
  ) {
    data.status = normaliseStatus(
      input.status ?? existing.status,
      input.startDate ?? new Date(existing.startDate),
      input.endDate ?? new Date(existing.endDate),
      willBePublished,
    );
  }

  const updated = await repository.updateTripById(id, data);
  if (!updated) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');

  return withDerived(updated);
}

export async function deleteTrip(id: string): Promise<TripWithDerived> {
  const deleted = await repository.deleteTripById(id);
  if (!deleted) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
  return withDerived(deleted);
}

/* ------------------------------------------------------------------------- *
 * Internals
 * ------------------------------------------------------------------------- */

/**
 * A stored status is only meaningful for the two manual states. For the rest we
 * persist what the dates imply, so the database and the UI agree even when a query
 * filters on `status` directly.
 *
 * `DRAFT` is the *unpublished* state, so it cannot coexist with `published: true`.
 * Rather than quietly overriding one of the two, the caller resolves the conflict
 * before reaching here — see `resolvePublishState`. `CANCELLED` is a real business
 * state and survives publication.
 */
function normaliseStatus(
  status: TripStatus | undefined,
  startDate: Date,
  endDate: Date,
  published: boolean,
): TripStatus {
  if (status === 'CANCELLED') return status;
  if (status === 'DRAFT' && !published) return status;

  return deriveStatus({
    status: 'UPCOMING',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
}

/**
 * Reconciles an explicit `status` choice with the `published` flag.
 *
 * Choosing `DRAFT` means "take this off the site" — so it unpublishes, rather than
 * being silently replaced by the date-derived status, which looked to the admin
 * like the status control simply did nothing. Asking for both `DRAFT` and
 * `published: true` in one request is contradictory, and is rejected with a message
 * that says which two settings disagree.
 */
function resolvePublishState(
  requestedStatus: TripStatus | undefined,
  requestedPublished: boolean | undefined,
  currentPublished: boolean,
): boolean {
  if (requestedStatus !== 'DRAFT') return requestedPublished ?? currentPublished;

  if (requestedPublished === true) {
    throw new ValidationError('A draft cannot be published. Set the status first, or publish it.', {
      status: ['A published trip cannot be a draft. Choose another status, or untick Published.'],
    });
  }

  // The admin picked Draft: honour it by taking the trip off the site.
  return false;
}

async function resolveSlug(base: string): Promise<string> {
  const normalised = slugify(base);
  if (!normalised) {
    throw new ConflictError(
      'Could not derive a URL slug from the title. Enter one manually.',
      'SLUG_TAKEN',
    );
  }

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = nextSlugCandidate(normalised, attempt);
    if (!(await repository.slugExists(candidate))) return candidate;
  }

  throw new ConflictError('Could not generate a unique slug for this trip', 'SLUG_TAKEN');
}

/** Maps validated input onto the document shape. Undefined keys are left untouched. */
function toDocument(input: Partial<CreateTripInput>): Partial<TripDocument> {
  const data: Partial<TripDocument> = {};

  const assign = <K extends keyof TripDocument>(key: K, value: TripDocument[K] | undefined) => {
    if (value !== undefined) data[key] = value;
  };

  assign('title', input.title);
  assign('shortDescription', input.shortDescription);
  assign('description', input.description);
  assign('destination', input.destination);
  assign('location', input.location);
  assign('meetingPoint', input.meetingPoint);
  assign('transportation', input.transportation);
  assign('reservationInformation', input.reservationInformation);

  assign('entertainment', input.entertainment);
  assign('includedServices', input.includedServices);
  assign('excludedServices', input.excludedServices);
  assign('importantNotes', input.importantNotes);

  assign('coverImage', input.coverImage ?? undefined);
  assign('gallery', input.gallery);

  assign('startDate', input.startDate);
  assign('endDate', input.endDate);
  if (input.reservationStartDate !== undefined) data.reservationStartDate = input.reservationStartDate;
  if (input.reservationEndDate !== undefined) data.reservationEndDate = input.reservationEndDate;

  assign('price', input.price);
  assign('currency', input.currency);
  assign('capacity', input.capacity);
  assign('availableSeats', input.availableSeats);

  assign('published', input.published);
  assign('featured', input.featured);
  assign('displayOrder', input.displayOrder);

  // `coverImage: null` is a meaningful value (remove the cover), so set it explicitly.
  if (input.coverImage === null) data.coverImage = null;

  return data;
}
