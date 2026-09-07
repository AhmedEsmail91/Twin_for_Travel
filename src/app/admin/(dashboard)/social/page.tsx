import type { Metadata } from 'next';

import { AdminPage } from '@/components/admin/AdminPage';
import { SocialManager } from '@/components/admin/SocialManager';
import { requireAdmin } from '@/modules/auth/auth.service';
import { listSocialLinks } from '@/modules/social/social.service';

export const metadata: Metadata = { title: 'Social links' };
export const dynamic = 'force-dynamic';

export default async function AdminSocialPage() {
  await requireAdmin();
  const links = await listSocialLinks();

  return (
    <AdminPage
      title="Social links"
      description="These drive the footer, the contact page and the floating menu on the public site."
    >
      <SocialManager initialLinks={links} />
    </AdminPage>
  );
}
