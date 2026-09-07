'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';
import type { TripImage } from '@/modules/trips/trip.types';
import type { Locale } from '@/i18n/routing';
import { pickLocale } from '@/lib/utils/localized';

/**
 * Trip photo gallery with a lightbox.
 *
 * Client-side because it is genuinely interactive. Keyboard support is a
 * requirement, not a nicety: arrow keys move between photos and Escape closes the
 * viewer, which the native `<dialog>` handles along with the focus trap.
 *
 * Arrow-key direction is mirrored in RTL so "next" always means "forward".
 */
export function TripGallery({
  images,
  locale,
  tripTitle,
}: {
  images: TripImage[];
  locale: Locale;
  tripTitle: string;
}) {
  const t = useTranslations('common');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isRtl = locale === 'ar';

  const close = useCallback(() => setActiveIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeIndex !== null && !dialog.open) dialog.showModal();
    if (activeIndex === null && dialog.open) dialog.close();
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();

      const forward = isRtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
      step(forward ? 1 : -1);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, isRtl, step]);

  if (images.length === 0) return null;

  const active = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <li key={`${image.storageKey}-${index}`}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md border border-sand bg-surface-sunk"
            >
              <Image
                src={image.url}
                alt={pickLocale(image.alt, locale) || `${tripTitle} — ${index + 1}`}
                fill
                sizes="(min-width: 640px) 30vw, 45vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <span className="sr-only">
                {t('image')} {index + 1} {t('of')} {images.length}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        aria-label={tripTitle}
        className="m-auto max-h-[92dvh] w-[min(64rem,calc(100vw-1.5rem))] rounded-lg bg-transparent p-0 backdrop:bg-navy-dark/85"
      >
        {active ? (
          <div className="relative">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-navy">
              <Image
                src={active.url}
                alt={pickLocale(active.alt, locale) || tripTitle}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="u-numeric text-caption font-semibold text-cream">
                {(activeIndex ?? 0) + 1} / {images.length}
              </p>

              <div className="flex items-center gap-2">
                <GalleryControl label={t('previous')} onClick={() => step(-1)} direction="back" />
                <GalleryControl label={t('next')} onClick={() => step(1)} direction="forward" />
                <GalleryControl label={t('close')} onClick={close} direction="close" />
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function GalleryControl({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: 'back' | 'forward' | 'close';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex size-10 items-center justify-center rounded-md border border-cream/30 text-cream transition-colors duration-150 hover:border-gold hover:bg-cream/10',
      )}
    >
      {direction === 'close' ? (
        <Icon name="close" size={18} />
      ) : (
        <Icon
          name="arrow"
          size={18}
          flipRtl
          className={direction === 'back' ? 'rotate-180' : undefined}
        />
      )}
    </button>
  );
}
