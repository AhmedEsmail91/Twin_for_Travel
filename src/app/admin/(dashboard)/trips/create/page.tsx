import type { Metadata } from 'next';

import { AdminPage } from '@/components/admin/AdminPage';
import { TripForm } from '@/components/admin/TripForm';
import { requireAdmin } from '@/modules/auth/auth.service';

export const metadata: Metadata = { title: 'New trip' };
export const dynamic = 'force-dynamic';

export default async function CreateTripPage() {
  await requireAdmin();

  return (
    <AdminPage
      title="New trip"
      description="Fill in at least a title, destination, dates, price and capacity. You can publish it once a cover image is set."
    >
      <TripForm />
    </AdminPage>
  );
}
