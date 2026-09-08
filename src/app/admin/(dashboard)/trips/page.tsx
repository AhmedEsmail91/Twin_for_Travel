import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { AdminPage } from '@/components/admin/AdminPage';
import { TripTable } from '@/components/admin/TripTable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getAdminLocale } from '@/i18n/admin-locale';
import { requireAdmin } from '@/modules/auth/auth.service';
import { listTrips } from '@/modules/trips/trip.service';

export const metadata: Metadata = { title: 'Trips' };
export const dynamic = 'force-dynamic';

export default async function AdminTripsPage() {
  await requireAdmin();
  const locale = await getAdminLocale();

  // The admin listing includes drafts, so `published` is deliberately unset.
  const [t, { items }] = await Promise.all([
    getTranslations({ locale, namespace: 'admin.trips' }),
    listTrips({ pageSize: 100, sortBy: 'startDate', sortDirection: 'desc' }),
  ]);

  return (
    <AdminPage
      title={t('title')}
      description={t('description')}
      action={
        <Button as={Link} href="/admin/trips/create" variant="primary">
          <Icon name="plus" size={17} />
          {t('newTrip')}
        </Button>
      }
    >
      <TripTable initialTrips={items} />
    </AdminPage>
  );
}
