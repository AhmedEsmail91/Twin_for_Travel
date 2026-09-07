'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from './LocaleSwitcher';
import { NavLink } from './NavLink';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/i18n/navigation';

/**
 * The mobile drawer.
 *
 * Slides in from the inline-start edge, so it opens from the right in Arabic and
 * the left in English without a direction check — `inset-inline-start` does the work.
 */
export function MobileMenu({
  items,
  companyName,
}: {
  items: { href: string; label: string }[];
  companyName: string;
}) {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const [open, setOpen] = useState(false);

  // Close on Escape, and stop the page behind the drawer from scrolling.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('menu')}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="rounded-md p-2 text-cream transition-colors duration-150 hover:bg-cream/10 lg:hidden"
      >
        <Icon name="menu" size={22} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-100 lg:hidden">
          <button
            type="button"
            aria-label={t('close')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-navy-dark/70 animate-fade-in"
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
            className="absolute inset-y-0 start-0 flex w-[min(20rem,85vw)] flex-col border-e border-navy-light bg-navy shadow-lifted"
          >
            <div className="flex items-center justify-between gap-3 border-b border-navy-light px-4 py-4">
              <span className="flex min-w-0 items-center gap-2.5">
                <Logo companyName={companyName} size={36} />
                <span className="truncate text-body-sm font-bold text-cream">{companyName}</span>
              </span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="rounded-md p-2 text-cream/80 transition-colors duration-150 hover:bg-cream/10 hover:text-cream"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  variant="drawer"
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </nav>

            <div className="flex flex-col gap-3 border-t border-navy-light p-4">
              <LocaleSwitcher onDark />
              <Button
                as={Link}
                href="/trips"
                variant="gold"
                fullWidth
                onClick={() => setOpen(false)}
              >
                {tNav('bookNow')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
