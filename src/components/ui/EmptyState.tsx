import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

/**
 * Every list has one. An empty grid with no explanation reads as a broken page.
 * CLAUDE.md §41.
 */
export function EmptyState({
  icon = 'info',
  title,
  body,
  action,
  onDark = false,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div
      className={
        onDark
          ? 'rounded-lg border border-cream/20 bg-navy-light/40 px-6 py-12 text-center'
          : 'rounded-lg border border-dashed border-sand bg-surface-sunk px-6 py-12 text-center'
      }
    >
      <span
        className={
          onDark
            ? 'mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-cream/25 text-cream/70'
            : 'mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold-dark'
        }
      >
        <Icon name={icon} size={22} />
      </span>

      <p className={onDark ? 'text-h3 text-cream' : 'text-h3 text-navy'}>{title}</p>
      {body ? (
        <p className={onDark ? 'mx-auto mt-2 max-w-md text-body-sm text-cream/70' : 'mx-auto mt-2 max-w-md text-body-sm text-ink-soft'}>
          {body}
        </p>
      ) : null}

      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
