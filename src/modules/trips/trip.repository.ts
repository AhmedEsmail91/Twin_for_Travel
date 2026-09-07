import 'server-only';

import type { QueryFilter, SortOrder } from 'mongoose';

import { connectToDatabase } from '@/lib/db/mongoose';
import { TripModel, type TripDocument } from './trip.model';
import type { Trip, TripListOptions } from './trip.types';
import type { Paginated } from '@/types/common';

/**
 * Every Mongoose query for trips lives here. Services and components never touch
 * the model directly, and nothing above this file receives a Mongoose document —
 * repositories return plain, serialisable objects. CLAUDE.md §6.
 */

function toTrip(document: TripDocument): Trip {
  return {
    id: String(document._id),

    title: { ar: document.title?.ar ?? '', en: document.title?.en ?? '' },
    slug: document.slug,
    shortDescription: {
      ar: document.shortDescription?.ar ?? '',
      en: document.shortDescription?.en ?? '',
    },
    description: { ar: document.description?.ar ?? '', en: document.description?.en ?? '' },

    coverImage: document.coverImage
      ? {
          url: document.coverImage.url,
          storageKey: document.coverImage.storageKey,
          alt: { ar: document.coverImage.alt?.ar ?? '', en: document.coverImage.alt?.en ?? '' },
          width: document.coverImage.width,
          height: document.coverImage.height,
        }
      : null,
    gallery: (document.gallery ?? []).map((image) => ({
      url: image.url,
      storageKey: image.storageKey,
      alt: { ar: image.alt?.ar ?? '', en: image.alt?.en ?? '' },
      width: image.width,
      height: image.height,
    })),

    destination: { ar: document.destination?.ar ?? '', en: document.destination?.en ?? '' },
    location: { ar: document.location?.ar ?? '', en: document.location?.en ?? '' },
    meetingPoint: { ar: document.meetingPoint?.ar ?? '', en: document.meetingPoint?.en ?? '' },
    transportation: { ar: document.transportation?.ar ?? '', en: document.transportation?.en ?? '' },

    startDate: document.startDate.toISOString(),
    endDate: document.endDate.toISOString(),
    reservationStartDate: document.reservationStartDate?.toISOString() ?? null,
    reservationEndDate: document.reservationEndDate?.toISOString() ?? null,

    price: document.price,
    currency: document.currency,
    capacity: document.capacity,
    availableSeats: document.availableSeats,

    status: document.status,
    published: document.published,
    featured: document.featured,
    displayOrder: document.displayOrder,

    entertainment: toList(document.entertainment),
    includedServices: toList(document.includedServices),
    excludedServices: toList(document.excludedServices),
    importantNotes: toList(document.importantNotes),
    reservationInformation: {
      ar: document.reservationInformation?.ar ?? '',
      en: document.reservationInformation?.en ?? '',
    },

    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function toList(value: { ar?: string[]; en?: string[] } | undefined) {
  return { ar: value?.ar ?? [], en: value?.en ?? [] };
}

/**
 * Builds a typed filter. User input only ever reaches this function as scalars that
 * are assigned to known fields — never spread into the query object — so a crafted
 * value cannot inject an operator. CLAUDE.md §16.
 */
function buildFilter(options: TripListOptions, now: Date): QueryFilter<TripDocument> {
  const filter: QueryFilter<TripDocument> = {};

  if (options.published !== undefined) filter.published = options.published;
  if (options.featured !== undefined) filter.featured = options.featured;
  if (options.status) filter.status = options.status;

  if (options.timeframe === 'upcoming') {
    filter.endDate = { $gte: now };
    filter.status = { $nin: ['DRAFT', 'CANCELLED', 'COMPLETED'] };
  } else if (options.timeframe === 'past') {
    filter.$or = [{ endDate: { $lt: now } }, { status: 'COMPLETED' }];
    filter.status = { $ne: 'DRAFT' };
  }

  if (options.search) {
    // Escaped so a search for "a.b" cannot become a wildcard pattern.
    const pattern = new RegExp(escapeRegExp(options.search), 'i');
    filter.$or = [
      { 'title.ar': pattern },
      { 'title.en': pattern },
      { 'destination.ar': pattern },
      { 'destination.en': pattern },
      { slug: pattern },
    ];
  }

  return filter;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function findTrips(options: TripListOptions): Promise<Paginated<Trip>> {
  await connectToDatabase();

  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const filter = buildFilter(options, new Date());

  const sort: Record<string, SortOrder> = {
    [options.sortBy ?? 'createdAt']: options.sortDirection === 'asc' ? 1 : -1,
  };
  // Stable ordering when the primary sort key ties.
  if (!('_id' in sort)) sort._id = -1;

  const [documents, total] = await Promise.all([
    TripModel.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<TripDocument[]>()
      .exec(),
    TripModel.countDocuments(filter).exec(),
  ]);

  return {
    items: documents.map(toTrip),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findTripBySlug(slug: string): Promise<Trip | null> {
  await connectToDatabase();
  const document = await TripModel.findOne({ slug }).lean<TripDocument>().exec();
  return document ? toTrip(document) : null;
}

export async function findTripById(id: string): Promise<Trip | null> {
  await connectToDatabase();
  if (!isObjectId(id)) return null;
  const document = await TripModel.findById(id).lean<TripDocument>().exec();
  return document ? toTrip(document) : null;
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  await connectToDatabase();
  const filter: QueryFilter<TripDocument> = { slug };
  if (excludeId && isObjectId(excludeId)) filter._id = { $ne: excludeId };
  return (await TripModel.exists(filter).exec()) !== null;
}

export async function insertTrip(data: Partial<TripDocument>): Promise<Trip> {
  await connectToDatabase();
  const document = await TripModel.create(data);
  return toTrip(document.toObject() as TripDocument);
}

export async function updateTripById(
  id: string,
  data: Partial<TripDocument>,
): Promise<Trip | null> {
  await connectToDatabase();
  if (!isObjectId(id)) return null;

  const document = await TripModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  )
    .lean<TripDocument>()
    .exec();

  return document ? toTrip(document) : null;
}

export async function deleteTripById(id: string): Promise<Trip | null> {
  await connectToDatabase();
  if (!isObjectId(id)) return null;
  const document = await TripModel.findByIdAndDelete(id).lean<TripDocument>().exec();
  return document ? toTrip(document) : null;
}

/** Powers the admin dashboard's summary cards with one round trip. */
export async function countTripsByStatus(): Promise<Record<string, number>> {
  await connectToDatabase();

  const [byStatus, featured, published] = await Promise.all([
    TripModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec(),
    TripModel.countDocuments({ featured: true }).exec(),
    TripModel.countDocuments({ published: true }).exec(),
  ]);

  const counts: Record<string, number> = { featured, published };
  let total = 0;

  for (const entry of byStatus) {
    counts[entry._id] = entry.count;
    total += entry.count;
  }

  counts.total = total;
  return counts;
}

function isObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}
