'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Icon } from '@/components/ui/Icon';
import { setAdminLocale } from '@/i18n/admin-locale.actions';
import { LOCALES, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

/** Toggles the dashboard's language cookie and re-renders the current page in it. */
export function AdminLanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = useTranslations('admin.language');
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setAdminLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="flex items-center gap-1 rounded-md border border-cream/20 p-1"
    >
      <Icon name="globe" size={15} className="ms-1.5 shrink-0 text-cream/50" />
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          disabled={pending}
          aria-pressed={code === locale}
          className={cn(
            'rounded-sm px-2 py-1 text-caption font-semibold transition-colors duration-150 disabled:opacity-60',
            code === locale ? 'bg-gold/20 text-gold-light' : 'text-cream/70 hover:text-cream',
          )}
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
