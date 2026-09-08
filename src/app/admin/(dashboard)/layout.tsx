import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdminLocale } from '@/i18n/admin-locale';
import { getCurrentAdmin } from '@/modules/auth/auth.service';

export const dynamic = 'force-dynamic';

/**
 * The authenticated shell.
 *
 * The session is verified here, on the server, for every page in this group. The
 * proxy's cookie check only saves a round trip — it is not the authority, and every
 * admin route handler checks again on its own. CLAUDE.md §28.
 *
 * `/admin/login` sits outside this group so it stays reachable when signed out.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const locale = await getAdminLocale();

  return (
    <div className="min-h-dvh lg:ps-64">
      <AdminSidebar adminName={admin.name || admin.email} locale={locale} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
