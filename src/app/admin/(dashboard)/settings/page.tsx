import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AdminPage } from '@/components/admin/AdminPage';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { getAdminLocale } from '@/i18n/admin-locale';
import { requireAdmin } from '@/modules/auth/auth.service';
import { getSiteSettingsForAdmin } from '@/modules/settings/settings.service';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const locale = await getAdminLocale();
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'admin.settings' }),
    getSiteSettingsForAdmin(),
  ]);

  return (
    <AdminPage title={t('title')} description={t('description')}>
      <SettingsForm settings={settings} />
    </AdminPage>
  );
}
