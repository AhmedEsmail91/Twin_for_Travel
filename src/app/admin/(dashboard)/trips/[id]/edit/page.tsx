import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminPage } from '@/components/admin/AdminPage';
import { TripForm } from '@/components/admin/TripForm';
import { Icon } from '@/components/ui/Icon';
import { AppError } from '@/lib/http/errors';
import { requireAdmin } from '@/modules/auth/auth.service';
import { getTripByIdOrThrow } from '@/modules/trips/trip.service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const trip = await getTripByIdOrThrow(id);
    return { title: `Edit · ${trip.title.en || trip.title.ar}` };
  } catch {
    return { title: 'Edit trip' };
  }
}

export default async function EditTripPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  let trip;
  try {
    trip = await getTripByIdOrThrow(id);
  } catch (error) {
    // A missing trip is a 404, not a crash; anything else is a real failure.
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  return (
    <AdminPage
      title={trip.title.en || trip.title.ar}
      description={`Last updated ${new Date(trip.updatedAt).toISOString().slice(0, 10)}`}
      action={
        trip.published ? (
          <Link
            href={`/ar/trips/${trip.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-sand px-4 py-2.5 text-body-sm font-semibold text-navy transition-colors duration-150 hover:border-gold hover:bg-gold/8"
          >
            <Icon name="globe" size={17} />
            View on site
          </Link>
        ) : null
      }
    >
      <TripForm trip={trip} />
    </AdminPage>
  );
}
