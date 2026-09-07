import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { VALUE_PILLARS } from '@/config/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * The reference's feature chips, reworked for the web: a gold medallion holding the
 * pictogram, then the claim and its explanation.
 */
export async function WhyUs({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'home.why' });

  return (
    <section className="border-y border-sand bg-surface-sunk py-18">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PILLARS.map((pillar) => (
            <li
              key={pillar.key}
              className="rounded-lg border border-sand bg-surface p-6 shadow-hairline"
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold-dark">
                <Icon name={pillar.icon} size={22} />
              </span>

              <h3 className="text-h3 text-navy">{t(`items.${pillar.key}.title`)}</h3>
              <p className="mt-2 text-body-sm text-ink-soft">{t(`items.${pillar.key}.body`)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
