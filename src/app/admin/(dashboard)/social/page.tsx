import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AdminPage } from '@/components/admin/AdminPage';
import { SocialManager } from '@/components/admin/SocialManager';
import { getAdminLocale } from '@/i18n/admin-locale';
import { requireAdmin } from '@/modules/auth/auth.service';
import { listSocialLinks } from '@/modules/social/social.service';

export const metadata: Metadata = { title: 'Social links' };
export const dynamic = 'force-dynamic';

export default async function AdminSocialPage() {
  await requireAdmin();
  const locale = await getAdminLocale();
  const [t, links] = await Promise.all([
    getTranslations({ locale, namespace: 'admin.social' }),
    listSocialLinks(),
  ]);

  return (
    <AdminPage title={t('title')} description={t('description')}>
      <SocialManager initialLinks={links} />
    </AdminPage>
  );
}
