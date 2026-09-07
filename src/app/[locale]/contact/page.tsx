import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PLATFORM_ICON } from '@/components/social/platform';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { pickLocale } from '@/lib/utils/localized';
import { buildWhatsappUrl, formatPhoneForDisplay } from '@/lib/utils/whatsapp';
import { getSiteSettings } from '@/modules/settings/settings.service';
import { getEnabledSocialLinks } from '@/modules/social/social.service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.contact' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/contact', locale),
    openGraph: { title: t('title'), description: t('description') },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, socialLinks, t, tSocial] = await Promise.all([
    getSiteSettings(),
    getEnabledSocialLinks(),
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'social' }),
  ]);

  const message = settings.whatsappMessage[locale]?.trim() || tSocial('whatsappDefaultMessage');
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsappUrl(settings.whatsappNumber, message)
    : '';

  const address = pickLocale(settings.address, locale);
  const hours = pickLocale(settings.workingHours, locale);

  return (
    <>
      <PageHeader eyebrow={tSocial('menuLabel')} title={t('title')} subtitle={t('subtitle')} />

      <Container className="py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-6">
            {whatsappUrl ? (
              <div className="rounded-lg border border-gold/35 bg-surface p-6 shadow-card u-gold-frame">
                <h2 className="flex items-center gap-3 text-h3 font-display text-navy">
                  <span className="flex size-10 items-center justify-center rounded-full bg-success/12 text-success">
                    <Icon name="whatsapp" size={20} />
                  </span>
                  {t('whatsappTitle')}
                </h2>

                <p className="mt-3 text-body-sm text-ink-soft">{t('whatsappBody')}</p>

                <p className="u-numeric mt-4 text-h3 font-bold text-navy">
                  {formatPhoneForDisplay(settings.whatsappNumber)}
                </p>

                <Button
                  as="a"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="gold"
                  className="mt-5"
                >
                  <Icon name="whatsapp" size={19} />
                  {tSocial('platforms.whatsapp')}
                </Button>
              </div>
            ) : null}

            <ul className="grid gap-4 sm:grid-cols-2">
              {settings.contactPhone ? (
                <ContactTile icon="phone" title={t('phoneTitle')}>
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                    className="u-numeric transition-colors duration-150 hover:text-gold-dark"
                  >
                    {formatPhoneForDisplay(settings.contactPhone)}
                  </a>
                </ContactTile>
              ) : null}

              {settings.contactEmail ? (
                <ContactTile icon="mail" title={t('emailTitle')}>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="break-all transition-colors duration-150 hover:text-gold-dark"
                  >
                    {settings.contactEmail}
                  </a>
                </ContactTile>
              ) : null}

              {address ? (
                <ContactTile icon="pin" title={t('addressTitle')}>
                  {settings.mapUrl ? (
                    <a
                      href={settings.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-150 hover:text-gold-dark"
                    >
                      {address}
                    </a>
                  ) : (
                    address
                  )}
                </ContactTile>
              ) : null}

              {hours ? (
                <ContactTile icon="clock" title={t('hoursTitle')}>
                  {hours}
                </ContactTile>
              ) : null}
            </ul>
          </div>

          {socialLinks.length > 0 ? (
            <aside className="rounded-lg border border-sand bg-surface p-6 shadow-card">
              <SectionHeading title={t('followTitle')} subtitle={t('followBody')} as="h2" />

              <ul className="mt-6 space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-md border border-sand px-4 py-3 text-body-sm font-semibold text-navy transition-colors duration-150 hover:border-gold hover:bg-gold/8"
                    >
                      <Icon name={PLATFORM_ICON[link.platform]} size={19} className="text-gold-dark" />
                      <span className="min-w-0 truncate">
                        {link.label || tSocial(`platforms.${link.platform}`)}
                      </span>
                      <Icon name="arrow" size={16} flipRtl className="ms-auto shrink-0 text-sand-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </Container>
    </>
  );
}

function ContactTile({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-lg border border-sand bg-surface p-5 shadow-hairline">
      <h3 className="mb-2 flex items-center gap-2 text-caption font-semibold text-ink-soft">
        <Icon name={icon} size={16} className="text-gold-dark" />
        {title}
      </h3>
      <p className="text-body-sm font-semibold text-navy">{children}</p>
    </li>
  );
}
