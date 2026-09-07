import {
  handleDeleteTrip,
  handleGetTrip,
  handleUpdateTrip,
} from '@/modules/trips/trip.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

export const GET = withApiHandler<Params>(async (_request, { params }) =>
  handleGetTrip((await params).id),
);

export const PATCH = withApiHandler<Params>(async (request, { params }) =>
  handleUpdateTrip(request, (await params).id),
);

export const DELETE = withApiHandler<Params>(async (_request, { params }) =>
  handleDeleteTrip((await params).id),
);
