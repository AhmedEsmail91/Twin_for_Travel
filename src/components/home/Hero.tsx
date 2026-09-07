import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';
import type { SiteSettings } from '@/modules/settings/settings.types';
import type { TripWithDerived } from '@/modules/trips/trip.types';

/**
 * The hero.
 *
 * Its backdrop is the cover image of the trip being promoted, so the company's own
 * photography does the emotional work and no stock imagery is shipped with the
 * project. With no published trips yet it falls back to a deep navy field with the
 * brand's warm sunset wash — still on-brand, never a broken image.
 */
export async function Hero({
  locale,
  settings,
  backdropTrip,
}: {
  locale: Locale;
  settings: SiteSettings;
  backdropTrip?: TripWithDerived;
}) {
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  const tagline = pickLocale(settings.tagline, locale);
  const cover = backdropTrip?.coverImage;

  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {cover ? (
        <Image
          src={cover.url}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
      ) : null}

      {/* Warm sunset wash: gold at the horizon, navy above — the logo's own light. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_100%,rgba(242,181,85,0.30),transparent_62%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,26,44,0.92),rgba(7,26,44,0.72)_45%,rgba(4,3,2,0.88))]"
      />

      <Container className="relative">
        <div className="flex max-w-3xl flex-col py-20 sm:py-28 lg:py-36">
          {tagline ? (
            <p className="u-label mb-5 flex items-center gap-3 text-gold-light">
              <span aria-hidden className="u-gold-rule h-px w-10 shrink-0" />
              {tagline}
            </p>
          ) : (
            <p className="u-label mb-5 text-gold-light">{t('eyebrow')}</p>
          )}

          <h1 className="text-display font-display text-cream">{t('title')}</h1>

          <p className="mt-6 max-w-2xl text-body text-cream/80 sm:text-lg">{t('subtitle')}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button as={Link} href="/trips" variant="gold" size="lg">
              {t('primaryCta')}
              <Icon name="arrow" size={18} flipRtl />
            </Button>

            <Button as={Link} href="/contact" variant="onDark" size="lg">
              {t('secondaryCta')}
            </Button>
          </div>
        </div>
      </Container>

      {/* The gold hairline that separates every band, as on the offer sheet. */}
      <div aria-hidden className="u-gold-rule absolute inset-x-0 bottom-0 h-px" />
    </section>
  );
}
