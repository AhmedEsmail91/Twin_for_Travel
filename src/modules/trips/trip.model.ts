import 'server-only';

import { Schema, model, models, type Model, type Types } from 'mongoose';

import { baseSerialisation, localizedField, localizedListField } from '@/lib/db/schema-helpers';
import { CURRENCIES, TRIP_STATUSES, type Currency, type TripStatus } from './trip.types';
import type { Localized, LocalizedList } from '@/types/common';

export type TripImageDocument = {
  url: string;
  storageKey: string;
  alt: Localized;
  width: number;
  height: number;
};

export type TripDocument = {
  _id: Types.ObjectId;

  title: Localized;
  slug: string;
  shortDescription: Localized;
  description: Localized;

  coverImage: TripImageDocument | null;
  gallery: TripImageDocument[];

  destination: Localized;
  location: Localized;
  meetingPoint: Localized;
  transportation: Localized;

  startDate: Date;
  endDate: Date;
  reservationStartDate: Date | null;
  reservationEndDate: Date | null;

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

  createdAt: Date;
  updatedAt: Date;
};

const tripImageSchema = new Schema<TripImageDocument>(
  {
    url: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    alt: localizedField({ maxLength: 200 }),
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false, versionKey: false },
);

const tripSchema = new Schema<TripDocument>(
  {
    title: localizedField({ required: true, maxLength: 160 }),
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 90,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    shortDescription: localizedField({ maxLength: 320 }),
    description: localizedField({ maxLength: 8000 }),

    coverImage: { type: tripImageSchema, default: null },
    gallery: { type: [tripImageSchema], default: () => [] },

    destination: localizedField({ maxLength: 120 }),
    location: localizedField({ maxLength: 200 }),
    meetingPoint: localizedField({ maxLength: 400 }),
    transportation: localizedField({ maxLength: 600 }),

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reservationStartDate: { type: Date, default: null },
    reservationEndDate: { type: Date, default: null },

    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: CURRENCIES, default: 'EGP' },
    capacity: { type: Number, required: true, min: 1, max: 5000 },
    availableSeats: { type: Number, required: true, min: 0, max: 5000 },

    status: { type: String, enum: TRIP_STATUSES, default: 'DRAFT', required: true },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },

    entertainment: localizedListField(),
    includedServices: localizedListField(),
    excludedServices: localizedListField(),
    importantNotes: localizedListField({ maxItemLength: 500 }),
    reservationInformation: localizedField({ maxLength: 2000 }),
  },
  { timestamps: true, toJSON: baseSerialisation, toObject: baseSerialisation },
);

/*
 * Indexes. Each one backs a query the application actually runs — see
 * CLAUDE.md §8 and docs/IMPLEMENTATION_PLAN.md Phase 2.
 */

// Public trip pages resolve by slug; uniqueness is a business rule.
tripSchema.index({ slug: 1 }, { unique: true });

// The public listings: published trips in a status, ordered by date.
tripSchema.index({ published: 1, status: 1, startDate: -1 });

// The homepage's featured rail.
tripSchema.index({ published: 1, featured: 1, displayOrder: 1, startDate: 1 });

// The admin table's default ordering.
tripSchema.index({ createdAt: -1 });

// Admin search across both languages.
tripSchema.index({ 'title.ar': 'text', 'title.en': 'text', 'destination.ar': 'text', 'destination.en': 'text' });

export const TripModel: Model<TripDocument> =
  (models.Trip as Model<TripDocument>) ?? model<TripDocument>('Trip', tripSchema);
