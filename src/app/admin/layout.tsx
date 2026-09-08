import type { Metadata } from 'next';
import { Cairo, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import '../globals.css';

import { getAdminLocale } from '@/i18n/admin-locale';
import { LOCALE_DIRECTION } from '@/i18n/routing';

/**
 * The admin tree's root layout.
 *
 * Deliberately separate from the public site: the dashboard is an internal tool with
 * its own language toggle (a cookie, not a URL locale segment — CLAUDE.md §10), so
 * `lang`/`dir` are derived from that cookie rather than from `next-intl`'s routing.
 * The *content* the dashboard edits has always been bilingual regardless.
 */
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

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · Twin for Travel' },
  // The dashboard must never appear in a search index.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={LOCALE_DIRECTION[locale]} className={`${manrope.variable} ${cairo.variable}`}>
      <body className="min-h-dvh bg-page text-ink antialiased">
        <NextIntlClientProvider locale={locale} messages={{ admin: messages.admin }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
