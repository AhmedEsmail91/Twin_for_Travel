import { getTranslations } from 'next-intl/server';

import { PLATFORM_ICON } from '@/components/social/platform';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { MAIN_NAV } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import { formatPhoneForDisplay } from '@/lib/utils/whatsapp';
import type { SiteSettings } from '@/modules/settings/settings.types';
import type { SocialLink } from '@/modules/social/social.types';

export async function SiteFooter({
  locale,
  settings,
  socialLinks,
}: {
  locale: Locale;
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  const [t, tNav, tSocial] = await Promise.all([
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'social' }),
  ]);

  const companyName = pickLocale(settings.companyName, locale);
  const about = pickLocale(settings.about, locale) || t('about');
  const address = pickLocale(settings.address, locale);

  return (
    <footer className="mt-auto border-t border-gold/25 bg-navy text-cream">
      <Container>
        {/* Extra inline-end padding keeps the last column clear of the floating button. */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Logo companyName={companyName} size={52} />
              <span className="text-body font-bold">{companyName}</span>
            </div>
            <p className="mt-4 max-w-sm text-body-sm text-cream/70">{about}</p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="u-label mb-4 text-gold-light">
              {t('explore')}
            </h2>
            <ul className="space-y-2.5">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-cream/75 transition-colors duration-150 hover:text-gold-light"
                  >
                    {tNav(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="u-label mb-4 text-gold-light">
              {t('contact')}
            </h2>
            <ul className="space-y-3 text-body-sm text-cream/75">
              {settings.whatsappNumber ? (
                <li className="flex items-start gap-2.5">
                  <Icon name="whatsapp" size={17} className="mt-0.5 shrink-0 text-gold-light" />
                  <span className="u-numeric">{formatPhoneForDisplay(settings.whatsappNumber)}</span>
                </li>
              ) : null}

              {settings.contactPhone ? (
                <li className="flex items-start gap-2.5">
                  <Icon name="phone" size={17} className="mt-0.5 shrink-0 text-gold-light" />
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                    className="u-numeric transition-colors duration-150 hover:text-gold-light"
                  >
                    {formatPhoneForDisplay(settings.contactPhone)}
                  </a>
                </li>
              ) : null}

              {settings.contactEmail ? (
                <li className="flex items-start gap-2.5">
                  <Icon name="mail" size={17} className="mt-0.5 shrink-0 text-gold-light" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="break-all transition-colors duration-150 hover:text-gold-light"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}

              {address ? (
                <li className="flex items-start gap-2.5">
                  <Icon name="pin" size={17} className="mt-0.5 shrink-0 text-gold-light" />
                  <span>{address}</span>
                </li>
              ) : null}
            </ul>
          </section>

          {socialLinks.length > 0 ? (
            <section aria-labelledby="footer-follow">
              <h2 id="footer-follow" className="u-label mb-4 text-gold-light">
                {t('follow')}
              </h2>
              <ul className="flex flex-wrap gap-2.5">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-10 items-center justify-center rounded-md border border-cream/20 text-cream/80 transition-colors duration-150 hover:border-gold hover:bg-cream/8 hover:text-gold-light"
                    >
                      <Icon name={PLATFORM_ICON[link.platform]} size={19} />
                      <span className="sr-only">
                        {link.label || tSocial(`platforms.${link.platform}`)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-cream/12 py-6 text-caption text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="u-numeric">© {new Date().getFullYear()}</span> {companyName}.{' '}
            {t('rights')}
          </p>
          <p>{t('builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
}
