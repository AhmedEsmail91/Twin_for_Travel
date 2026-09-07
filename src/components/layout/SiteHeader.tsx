import { getTranslations } from 'next-intl/server';

import { MobileMenu } from './MobileMenu';
import { NavLink } from './NavLink';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { MAIN_NAV } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import type { SiteSettings } from '@/modules/settings/settings.types';

/**
 * A Server Component. Only the two genuinely interactive pieces — the mobile drawer
 * and the locale switcher — are client components. CLAUDE.md §33.
 */
export async function SiteHeader({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const t = await getTranslations({ locale, namespace: 'nav' });

  const companyName = pickLocale(settings.companyName, locale);
  const tagline = pickLocale(settings.tagline, locale);

  const navItems = MAIN_NAV.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <header className="sticky top-0 z-50 border-b border-navy-light/60 bg-navy/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-18 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
          >
            <Logo companyName={companyName} size={44} priority />
            <span className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-body-sm font-bold text-cream">{companyName}</span>
              {tagline ? (
                <span className="u-label truncate text-[0.65rem] text-gold-light/80">{tagline}</span>
              ) : null}
            </span>
          </Link>

          <nav aria-label={t('home')} className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LocaleSwitcher onDark />
            </div>

            <Button as={Link} href="/trips" variant="gold" size="sm" className="hidden sm:inline-flex">
              {t('bookNow')}
            </Button>

            <MobileMenu items={navItems} companyName={companyName} />
          </div>
        </div>
      </Container>
    </header>
  );
}
