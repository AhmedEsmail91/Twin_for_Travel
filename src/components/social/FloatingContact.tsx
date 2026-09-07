'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { PLATFORM_HOVER, PLATFORM_ICON } from './platform';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';
import { buildWhatsappUrl } from '@/lib/utils/whatsapp';
import type { SiteSettings } from '@/modules/settings/settings.types';
import type { SocialLink } from '@/modules/social/social.types';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/routing';

/**
 * The fixed WhatsApp button and the expandable social menu.
 *
 * Positioned on the inline-end edge so it sits bottom-left in Arabic and
 * bottom-right in English. It clears the safe-area inset on iOS and never covers
 * page content, because the footer reserves matching space.
 *
 * Both the number and the links come from the database — nothing here is
 * hard-coded (CLAUDE.md §24). If the admin hasn't configured a WhatsApp number,
 * the button simply doesn't render.
 */
export function FloatingContact({
  settings,
  socialLinks,
}: {
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  const t = useTranslations('social');
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const whatsappMessage = settings.whatsappMessage[locale]?.trim() || t('whatsappDefaultMessage');
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsappUrl(settings.whatsappNumber, whatsappMessage)
    : '';

  // The floating menu duplicates WhatsApp, which already has its own button.
  const otherLinks = socialLinks.filter((link) => link.platform !== 'whatsapp');

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (!whatsappUrl && otherLinks.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 z-90 flex flex-col items-center gap-3 end-5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {otherLinks.length > 0 ? (
        <>
          <ul
            id="floating-social-menu"
            aria-label={t('menuLabel')}
            className={cn(
              'flex flex-col items-center gap-2.5 transition-all duration-200 ease-out',
              open
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-2 opacity-0',
            )}
            hidden={!open}
          >
            {otherLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label || t(`platforms.${link.platform}`)}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-full border border-sand bg-surface text-navy shadow-card transition-colors duration-150',
                    PLATFORM_HOVER[link.platform],
                  )}
                >
                  <Icon name={PLATFORM_ICON[link.platform]} size={20} />
                  <span className="sr-only">{link.label || t(`platforms.${link.platform}`)}</span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="floating-social-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            className="flex size-11 items-center justify-center rounded-full border border-gold/50 bg-navy text-gold-light shadow-card transition-colors duration-150 hover:bg-navy-light"
          >
            <Icon
              name={open ? 'close' : 'plus'}
              size={20}
              className="transition-transform duration-200"
            />
          </button>
        </>
      ) : null}

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('whatsappAria')}
          className="group flex size-14 items-center justify-center rounded-full bg-success text-white shadow-lifted transition-transform duration-150 ease-out hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold-dark"
        >
          <Icon name="whatsapp" size={28} />
        </a>
      ) : null}
    </div>
  );
}
