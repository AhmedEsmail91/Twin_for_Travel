import type { Metadata } from 'next';

import { AdminPage } from '@/components/admin/AdminPage';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { requireAdmin } from '@/modules/auth/auth.service';
import { getSiteSettingsForAdmin } from '@/modules/settings/settings.service';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettingsForAdmin();

  return (
    <AdminPage
      title="Settings"
      description="Company details, WhatsApp and contact information. Changes appear on the site immediately."
    >
      <SettingsForm settings={settings} />
    </AdminPage>
  );
}
