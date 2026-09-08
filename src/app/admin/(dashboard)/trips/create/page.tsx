import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AdminPage } from '@/components/admin/AdminPage';
import { TripForm } from '@/components/admin/TripForm';
import { getAdminLocale } from '@/i18n/admin-locale';
import { requireAdmin } from '@/modules/auth/auth.service';

export const metadata: Metadata = { title: 'New trip' };
export const dynamic = 'force-dynamic';

export default async function CreateTripPage() {
  await requireAdmin();
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin.tripForm' });

  return (
    <AdminPage title={t('metaNew')} description={t('newDescription')}>
      <TripForm />
    </AdminPage>
  );
}
