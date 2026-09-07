import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildWhatsappUrl } from '@/lib/utils/whatsapp';
import type { SiteSettings } from '@/modules/settings/settings.types';

/** The navy closing band, mirroring the contact strip at the foot of the offer sheet. */
export async function ContactCta({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const [t, tSocial] = await Promise.all([
    getTranslations({ locale, namespace: 'home.cta' }),
    getTranslations({ locale, namespace: 'social' }),
  ]);

  const message = settings.whatsappMessage[locale]?.trim() || tSocial('whatsappDefaultMessage');
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsappUrl(settings.whatsappNumber, message)
    : '';

  return (
    <section className="relative isolate overflow-hidden bg-navy py-18">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(193,146,88,0.22),transparent_60%)]"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="u-label mb-4 text-gold-light">{t('eyebrow')}</p>
          <h2 className="text-h1 font-display text-cream">{t('title')}</h2>
          <p className="mt-4 text-body text-cream/75">{t('subtitle')}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {whatsappUrl ? (
              <Button
                as="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="gold"
                size="lg"
              >
                <Icon name="whatsapp" size={20} />
                {t('whatsapp')}
              </Button>
            ) : null}

            <Button as={Link} href="/trips" variant="onDark" size="lg">
              {t('browse')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
