import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';

import '../globals.css';

/**
 * The admin tree's root layout.
 *
 * Deliberately separate from the public site: the dashboard is an internal tool, so
 * it is English/LTR regardless of the visitor's locale, while the *content* it edits
 * stays bilingual. Only Manrope is loaded — no display serif, no Arabic face — which
 * keeps the dashboard light. CLAUDE.md §10, §45.
 */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · Twin for Travel' },
  // The dashboard must never appear in a search index.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={manrope.variable}>
      <body className="min-h-dvh bg-page text-ink antialiased">{children}</body>
    </html>
  );
}
