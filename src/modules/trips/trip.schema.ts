import { z } from 'zod';

import { SLUG_PATTERN } from '@/lib/utils/slug';
import { CURRENCIES, MANUAL_TRIP_STATUSES, TRIP_STATUSES } from './trip.types';

/**
 * Validation for the trip module. Server-side validation always runs against these
 * schemas; the admin form reuses them for client-side feedback. CLAUDE.md §53.
 *
 * Create and update share one field definition; the update schema strips the
 * defaults rather than calling `.partial()` — see `optionalise` below for why.
 */

/**
 * `.partial()` makes a field optional but *keeps* its `.default()`. A PATCH carrying
 * only `{ published: true }` would therefore reset every omitted field to its
 * default — blanking descriptions, emptying service lists and reverting the status.
 *
 * `optionalise` strips the default as well, so an absent key stays absent all the
 * way down to the repository, which only assigns the keys it is given.
 */
type Optionalised<T extends z.ZodType> =
  T extends z.ZodDefault<infer Inner> ? z.ZodOptional<Inner> : z.ZodOptional<T>;

function toOptional<T extends z.ZodType>(schema: T): Optionalised<T> {
  const inner: z.ZodType = schema instanceof z.ZodDefault ? (schema.unwrap() as z.ZodType) : schema;
  return inner.optional() as Optionalised<T>;
}

type Shape = Record<string, z.ZodType>;

function optionalise<S extends Shape>(shape: S): { [K in keyof S]: Optionalised<S[K]> } {
  const out = {} as { [K in keyof S]: Optionalised<S[K]> };

  for (const [key, schema] of Object.entries(shape) as [keyof S, z.ZodType][]) {
    out[key] = toOptional(schema) as Optionalised<S[typeof key]>;
  }

  return out;
}

function localized(max: number, options: { requireOne?: boolean; label?: string } = {}) {
  const base = z.object({
    ar: z.string().trim().max(max, `Arabic text must be ${max} characters or fewer`).default(''),
    en: z.string().trim().max(max, `English text must be ${max} characters or fewer`).default(''),
  });

  if (options.requireOne) {
    return base.refine(
      (value) => value.ar.length > 0 || value.en.length > 0,
      `${options.label ?? 'This field'} is required in at least one language`,
    );
  }

  return base.default({ ar: '', en: '' });
}

function localizedList(maxItemLength = 300, maxItems = 40) {
  return z
    .object({
      ar: z.array(z.string().trim().min(1).max(maxItemLength)).max(maxItems).default([]),
      en: z.array(z.string().trim().min(1).max(maxItemLength)).max(maxItems).default([]),
    })
    .default({ ar: [], en: [] });
}

export const tripImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  storageKey: z.string().min(1, 'Image storage key is required'),
  alt: z.object({
    ar: z.string().trim().max(200).default(''),
    en: z.string().trim().max(200).default(''),
  }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** Accepts an ISO string or `yyyy-MM-dd` and yields a Date. */
const dateInput = z.coerce.date({ error: 'Enter a valid date' });

const tripFields = {
  title: localized(160, { requireOne: true, label: 'Title' }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'The slug must be at least 2 characters')
    .max(90, 'The slug must be 90 characters or fewer')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens only')
    .optional(),
  shortDescription: localized(320),
  description: localized(8000),

  coverImage: tripImageSchema.nullable().default(null),
  gallery: z
    .array(tripImageSchema)
    .max(40, 'A trip can hold at most 40 gallery images')
    .default([]),

  destination: localized(120, { requireOne: true, label: 'Destination' }),
  location: localized(200),
  meetingPoint: localized(400),
  transportation: localized(600),

  startDate: dateInput,
  endDate: dateInput,
  reservationStartDate: dateInput.nullable().default(null),
  reservationEndDate: dateInput.nullable().default(null),

  price: z.coerce
    .number({ error: 'Enter a price' })
    .min(0, 'The price cannot be negative')
    .max(10_000_000, 'That price looks incorrect'),
  currency: z.enum(CURRENCIES).default('EGP'),
  capacity: z.coerce
    .number({ error: 'Enter a capacity' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(5000, 'Capacity must be 5000 or fewer'),
  availableSeats: z.coerce
    .number({ error: 'Enter the number of available seats' })
    .int('Available seats must be a whole number')
    .min(0, 'Available seats cannot be negative')
    .max(5000),

  status: z.enum(TRIP_STATUSES).default('DRAFT'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),

  entertainment: localizedList(),
  includedServices: localizedList(),
  excludedServices: localizedList(),
  importantNotes: localizedList(500),
  reservationInformation: localized(2000),
};

/**
 * Cross-field rules, shared by create and update.
 *
 * Written against a partial shape so one function serves both. Each rule skips
 * itself when the fields it compares are absent from the request — an update that
 * touches only the price should not be rejected for "missing" dates.
 */
type TripInvariants = {
  startDate?: Date;
  endDate?: Date;
  reservationStartDate?: Date | null;
  reservationEndDate?: Date | null;
  capacity?: number;
  availableSeats?: number;
  published?: boolean;
  coverImage?: unknown;
};

function checkTripInvariants(value: TripInvariants, ctx: z.RefinementCtx): void {
  const { startDate, endDate, reservationStartDate, reservationEndDate } = value;

  if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'The return date must be on or after the departure date',
    });
  }

  if (
    reservationStartDate &&
    reservationEndDate &&
    reservationEndDate.getTime() < reservationStartDate.getTime()
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['reservationEndDate'],
      message: 'Reservations must close on or after they open',
    });
  }

  if (
    value.capacity !== undefined &&
    value.availableSeats !== undefined &&
    value.availableSeats > value.capacity
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['availableSeats'],
      message: 'Available seats cannot exceed the capacity',
    });
  }

  /*
   * A published trip with no cover image renders as an empty card. On an update the
   * cover may already be stored, so this only fires when the request itself sets
   * `published: true` and explicitly clears (or omits, on create) the image; the
   * service re-checks against the persisted trip.
   */
  if (value.published === true && value.coverImage === null) {
    ctx.addIssue({
      code: 'custom',
      path: ['coverImage'],
      message: 'Add a cover image before publishing this trip',
    });
  }
}

export const createTripSchema = z.object(tripFields).superRefine(checkTripInvariants);

export const updateTripSchema = z
  .object(optionalise(tripFields))
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update')
  .superRefine(checkTripInvariants);

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

/** Query-string schema for `GET /api/trips`. */
export const tripQuerySchema = z.object({
  status: z.enum(TRIP_STATUSES).optional(),
  published: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  timeframe: z.enum(['upcoming', 'past']).optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['startDate', 'createdAt', 'displayOrder', 'price']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type TripQueryInput = z.infer<typeof tripQuerySchema>;

export const MANUAL_STATUS_VALUES = MANUAL_TRIP_STATUSES;
