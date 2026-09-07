import type { Metadata, Viewport } from 'next';
import { Cairo, Manrope, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import '../globals.css';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { FloatingContact } from '@/components/social/FloatingContact';
import { APP_URL, SITE } from '@/config/site';
import { LOCALES, LOCALE_DIRECTION, LOCALE_TAG, routing, type Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/metadata';
import { pickLocale } from '@/lib/utils/localized';
import { getSiteSettings } from '@/modules/settings/settings.service';
import { getEnabledSocialLinks } from '@/modules/social/social.service';

/*
 * Three families, each with a job (docs/BRAND_ANALYSIS.md §2.2):
 *   Playfair Display — Latin display, the editorial warmth of a premium travel brand
 *   Manrope         — Latin body and UI, with the tabular numerals prices need
 *   Cairo           — all Arabic; weight, not style, carries the display/body split
 *
 * Self-hosted by next/font, so there is no third-party request at runtime and no
 * layout shift from a late webfont.
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#071a2c',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'meta.home' }),
    getSiteSettings(),
  ]);

  // The admin's SEO overrides win; the translated copy is the fallback.
  const companyName = pickLocale(settings.companyName, locale) || SITE.name;
  const title = pickLocale(settings.seoTitle, locale) || t('title');
  const description = pickLocale(settings.seoDescription, locale) || t('description');

  return {
    metadataBase: new URL(APP_URL),
    title: { default: title, template: `%s — ${companyName}` },
    description,
    applicationName: companyName,
    alternates: buildAlternates('/', locale),
    openGraph: {
      type: 'website',
      siteName: companyName,
      locale: LOCALE_TAG[locale],
      title,
      description,
      url: `/${locale}`,
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: companyName }],
    },
    twitter: { card: 'summary_large_image', title, description },
    icons: { icon: SITE.logo.src, apple: SITE.logo.src },
    robots: { index: true, follow: true },
  };
}

/**
 * The locale layout is this tree's root layout: it owns `<html>` because `lang` and
 * `dir` are locale-derived, and nothing below it should ever set direction again.
 * CLAUDE.md §11.
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const [t, settings, socialLinks] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getSiteSettings(),
    getEnabledSocialLinks(),
  ]);

  return (
    <html
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      className={`${manrope.variable} ${playfair.variable} ${cairo.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-page text-ink antialiased">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only rounded-md bg-navy px-4 py-2 text-cream focus:not-sr-only focus:absolute focus:top-3 focus:z-100 focus:inline-block focus:start-3"
          >
            {t('skipToContent')}
          </a>

          <SiteHeader locale={locale as Locale} settings={settings} />

          <main id="main" className="flex-1">
            {children}
          </main>

          <SiteFooter locale={locale as Locale} settings={settings} socialLinks={socialLinks} />
          <FloatingContact settings={settings} socialLinks={socialLinks} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
