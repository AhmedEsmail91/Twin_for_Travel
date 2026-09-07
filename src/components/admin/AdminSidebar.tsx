'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { SITE } from '@/config/site';
import { cn } from '@/lib/utils/cn';

const ADMIN_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Overview', icon: 'globe' },
  { href: '/admin/trips', label: 'Trips', icon: 'plane' },
  { href: '/admin/social', label: 'Social links', icon: 'sparkles' },
  { href: '/admin/settings', label: 'Settings', icon: 'shield' },
];

/**
 * Navy sidebar, gold active state (CLAUDE.md §45). Collapses to a slide-in drawer
 * below `lg`, driven by the header's menu button through a shared `open` state.
 */
export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = ADMIN_NAV.map((item) => ({
    ...item,
    active: item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href),
  }));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="fixed top-3 z-70 rounded-md border border-navy-light bg-navy p-2.5 text-cream shadow-card start-3 lg:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-70 cursor-default bg-navy-dark/60 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 z-80 flex w-64 flex-col border-e border-navy-light bg-navy transition-transform duration-200 ease-out start-0',
          'lg:translate-x-0 lg:rtl:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-navy-light px-4 py-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <Logo companyName={SITE.name} size={36} />
            <span className="min-w-0">
              <span className="block truncate text-body-sm font-bold text-cream">{SITE.name}</span>
              <span className="u-label block text-[0.6rem] text-gold-light/70">Dashboard</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-cream/70 hover:bg-cream/10 hover:text-cream lg:hidden"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-semibold transition-colors duration-150',
                item.active
                  ? 'bg-gold/15 text-gold-light'
                  : 'text-cream/75 hover:bg-cream/8 hover:text-cream',
              )}
            >
              <Icon name={item.icon} size={18} className="shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-navy-light p-3">
          <p className="px-3 pb-2 text-caption text-cream/50">Signed in as</p>
          <p className="truncate px-3 pb-3 text-body-sm font-semibold text-cream">{adminName}</p>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}

function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        } finally {
          /*
           * `refresh()` discards the client's cached server renders so no admin data
           * survives the sign-out; the dashboard layout then re-checks the session
           * on the server and redirects anyway.
           */
          router.replace('/admin/login');
          router.refresh();
        }
      }}
      className="flex w-full items-center gap-2.5 rounded-md border border-cream/20 px-3 py-2.5 text-body-sm font-semibold text-cream/80 transition-colors duration-150 hover:border-danger hover:bg-danger/15 hover:text-cream disabled:opacity-60"
    >
      <Icon name="arrow" size={17} />
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
