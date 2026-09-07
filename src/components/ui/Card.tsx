import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * The offer sheet's card: white surface, hairline sand border, warm low shadow.
 * `gold` adds the inset gold frame used for emphasised rows.
 */
export function Card({
  children,
  className,
  tone = 'default',
  as: Component = 'div',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'gold' | 'sunk' | 'navy';
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  const tones = {
    default: 'bg-surface border-sand shadow-card',
    gold: 'bg-surface border-gold/35 shadow-card u-gold-frame',
    sunk: 'bg-surface-sunk border-sand',
    navy: 'bg-navy border-navy-light text-cream shadow-lifted',
  } as const;

  return (
    <Component className={cn('rounded-lg border', tones[tone], className)}>{children}</Component>
  );
}
