'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/Icon';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, LOCALE_LABEL, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

/**
 * Switches locale while staying on the same page.
 *
 * `usePathname` from the i18n navigation helpers returns the path *without* the
 * locale prefix, so the same route is re-resolved under the new locale rather than
 * sending the visitor back to the homepage.
 */
export function LocaleSwitcher({ onDark = false }: { onDark?: boolean }) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = (params.locale as Locale) ?? 'ar';

  return (
    <div
      role="group"
      aria-label={t('switchLanguage')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border p-0.5',
        onDark ? 'border-cream/25' : 'border-sand',
        isPending && 'opacity-60',
      )}
    >
      <Icon
        name="globe"
        size={15}
        className={cn('mx-1.5', onDark ? 'text-cream/60' : 'text-ink-soft')}
      />

      {LOCALES.map((locale) => {
        const active = locale === current;

        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={active ? 'true' : undefined}
            disabled={active || isPending}
            onClick={() => {
              startTransition(() => {
                /*
                 * `usePathname` returns the path without the locale prefix and with
                 * dynamic segments already resolved, so the visitor lands on the same
                 * page. The query string is carried across so an active trip filter
                 * survives the switch.
                 */
                const query = searchParams.toString();
                router.replace(query ? `${pathname}?${query}` : pathname, { locale });
              });
            }}
            className={cn(
              'rounded-sm px-2.5 py-1 text-caption font-semibold transition-colors duration-150',
              active
                ? onDark
                  ? 'bg-cream/15 text-cream'
                  : 'bg-navy text-cream'
                : onDark
                  ? 'text-cream/70 hover:text-cream'
                  : 'text-ink-soft hover:text-navy',
            )}
          >
            {LOCALE_LABEL[locale]}
          </button>
        );
      })}
    </div>
  );
}
