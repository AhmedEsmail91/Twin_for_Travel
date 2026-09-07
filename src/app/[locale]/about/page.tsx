import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ContactCta } from '@/components/home/ContactCta';
import { WhyUs } from '@/components/home/WhyUs';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { pickLocale } from '@/lib/utils/localized';
import { getSiteSettings } from '@/modules/settings/settings.service';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.about' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/about', locale),
    openGraph: { title: t('title'), description: t('description') },
  };
}

const VALUES = ['comfort', 'clarity', 'care'] as const;
const VALUE_ICONS = { comfort: 'car', clarity: 'info', care: 'headset' } as const;

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations({ locale, namespace: 'about' }),
  ]);

  const companyName = pickLocale(settings.companyName, locale);
  // The admin's own "about" text wins; the translated copy is the fallback.
  const story = pickLocale(settings.about, locale) || t('story');

  return (
    <>
      <PageHeader eyebrow={companyName} title={t('title')} subtitle={t('subtitle')} />

      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div>
            <SectionHeading title={t('storyTitle')} as="h2" />
            <div className="mt-5 space-y-4 text-body text-ink-soft">
              {story
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* The badge gets a calm, light field — never photography or gold. */}
          <div className="flex justify-center rounded-lg border border-sand bg-surface p-10 shadow-hairline">
            <Logo companyName={companyName} size={168} />
          </div>
        </div>
      </Container>

      <section className="border-y border-sand bg-page py-16">
        <Container>
          <SectionHeading title={t('valuesTitle')} align="center" />

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {VALUES.map((value) => (
              <li key={value} className="rounded-lg border border-sand bg-surface p-6 shadow-hairline">
                <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold-dark">
                  <Icon name={VALUE_ICONS[value]} size={20} />
                </span>
                <h3 className="text-h3 text-navy">{t(`values.${value}.title`)}</h3>
                <p className="mt-2 text-body-sm text-ink-soft">{t(`values.${value}.body`)}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <WhyUs locale={locale} />

      <ContactCta locale={locale} settings={settings} />
    </>
  );
}
