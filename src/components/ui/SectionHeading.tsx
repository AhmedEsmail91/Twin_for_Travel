import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * The reference's section opener: a small gold eyebrow over a gold hairline, then
 * the heading. Used everywhere so section rhythm stays identical across the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  onDark = false,
  as: Heading = 'h2',
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
  onDark?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center',
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow ? (
          <p
            className={cn(
              'u-label mb-3 flex items-center gap-3',
              align === 'center' && 'justify-center',
              onDark ? 'text-gold-light' : 'text-gold-dark',
            )}
          >
            <span aria-hidden className="u-gold-rule h-px w-8 shrink-0" />
            {eyebrow}
          </p>
        ) : null}

        <Heading
          className={cn(
            Heading === 'h1' ? 'text-h1' : 'text-h2',
            'font-display',
            onDark ? 'text-cream' : 'text-navy',
          )}
        >
          {title}
        </Heading>

        {subtitle ? (
          <p className={cn('mt-3 text-body', onDark ? 'text-cream/75' : 'text-ink-soft')}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
