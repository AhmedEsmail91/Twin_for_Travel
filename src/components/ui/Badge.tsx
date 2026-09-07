import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'navy' | 'gold' | 'sand' | 'success' | 'warning' | 'danger' | 'onDark';

const TONES: Record<BadgeTone, string> = {
  navy: 'bg-navy text-cream',
  gold: 'bg-gold/18 text-gold-dark border border-gold/45',
  sand: 'bg-surface-sunk text-ink-soft border border-sand',
  success: 'bg-success/12 text-success border border-success/35',
  warning: 'bg-warning/12 text-warning border border-warning/35',
  danger: 'bg-danger/12 text-danger border border-danger/35',
  onDark: 'bg-cream/12 text-cream border border-cream/25',
};

export function Badge({
  children,
  tone = 'sand',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-caption font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
