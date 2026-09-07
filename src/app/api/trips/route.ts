import { handleCreateTrip, handleListTrips } from '@/modules/trips/trip.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiHandler((request) => handleListTrips(request));
export const POST = withApiHandler((request) => handleCreateTrip(request));
