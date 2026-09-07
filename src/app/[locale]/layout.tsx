import { Cairo, Manrope, Playfair_Display } from 'next/font/google';
import '../globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500','600','700'], variable: '--font-playfair', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-manrope', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic','latin'], weight: ['400','500','600','700','900'], variable: '--font-cairo', display: 'swap' });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${manrope.variable} ${playfair.variable} ${cairo.variable}`}>
      <body className="bg-page text-ink">{children}</body>
    </html>
  );
}
