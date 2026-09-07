import 'server-only';

import type { NextResponse } from 'next/server';

import { created, ok, type ApiSuccess } from '@/lib/http/response';
import { getCurrentAdmin, requireAdmin } from '@/modules/auth/auth.service';
import { createTripSchema, tripQuerySchema, updateTripSchema } from './trip.schema';
import * as service from './trip.service';
import type { TripWithDerived } from './trip.types';
import type { Paginated } from '@/types/common';

/**
 * Trip HTTP boundary. Reads are public but constrained: an anonymous caller may only
 * ever see published trips, whatever the query string asks for.
 */

export async function handleListTrips(
  request: Request,
): Promise<NextResponse<ApiSuccess<Paginated<TripWithDerived>>>> {
  const query = tripQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );

  // An anonymous caller only ever sees published trips, whatever the query asks for.
  const session = await getCurrentAdmin();
  const published = session ? query.published : true;

  const result = await service.listTrips({ ...query, published });
  return ok(result);
}

export async function handleGetTrip(id: string): Promise<NextResponse<ApiSuccess<TripWithDerived>>> {
  await requireAdmin();
  return ok(await service.getTripByIdOrThrow(id));
}

export async function handleCreateTrip(
  request: Request,
): Promise<NextResponse<ApiSuccess<TripWithDerived>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const input = createTripSchema.parse(body);

  return created(await service.createTrip(input));
}

export async function handleUpdateTrip(
  request: Request,
  id: string,
): Promise<NextResponse<ApiSuccess<TripWithDerived>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const input = updateTripSchema.parse(body);

  return ok(await service.updateTrip(id, input));
}

export async function handleDeleteTrip(
  id: string,
): Promise<NextResponse<ApiSuccess<{ id: string }>>> {
  await requireAdmin();

  const deleted = await service.deleteTrip(id);
  return ok({ id: deleted.id });
}
