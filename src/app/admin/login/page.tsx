import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/ui/Logo';
import { SITE } from '@/config/site';
import { getCurrentAdmin } from '@/modules/auth/auth.service';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Already signed in? Skip the form.
  if (await getCurrentAdmin()) redirect('/admin');

  const { next } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo companyName={SITE.name} size={72} priority />
          <h1 className="mt-5 text-h2 font-bold text-cream">{SITE.name}</h1>
          <p className="u-label mt-2 text-gold-light">Dashboard</p>
        </div>

        <div className="rounded-lg border border-gold/25 bg-surface p-6 shadow-lifted sm:p-8">
          <LoginForm nextPath={next} />
        </div>

        <p className="mt-6 text-center text-caption text-cream/50">
          Authorised staff only.
        </p>
      </div>
    </main>
  );
}
