import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminPage } from '@/components/admin/AdminPage';
import { TripTable } from '@/components/admin/TripTable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { requireAdmin } from '@/modules/auth/auth.service';
import { listTrips } from '@/modules/trips/trip.service';

export const metadata: Metadata = { title: 'Trips' };
export const dynamic = 'force-dynamic';

export default async function AdminTripsPage() {
  await requireAdmin();

  // The admin listing includes drafts, so `published` is deliberately unset.
  const { items } = await listTrips({ pageSize: 100, sortBy: 'startDate', sortDirection: 'desc' });

  return (
    <AdminPage
      title="Trips"
      description="Create, edit, publish and archive the trips shown on the public site."
      action={
        <Button as={Link} href="/admin/trips/create" variant="primary">
          <Icon name="plus" size={17} />
          New trip
        </Button>
      }
    >
      <TripTable initialTrips={items} />
    </AdminPage>
  );
}
