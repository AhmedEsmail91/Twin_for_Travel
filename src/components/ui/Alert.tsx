import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';
import { cn } from '@/lib/utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<AlertTone, { className: string; icon: IconName }> = {
  info: { className: 'border-gold/40 bg-gold/10 text-navy', icon: 'info' },
  success: { className: 'border-success/35 bg-success/10 text-success', icon: 'check' },
  warning: { className: 'border-warning/35 bg-warning/10 text-warning', icon: 'info' },
  danger: { className: 'border-danger/35 bg-danger/10 text-danger', icon: 'info' },
};

/**
 * `role="status"` (polite) for confirmations, `role="alert"` (assertive) for errors,
 * so a save result is announced without interrupting, and a failure is.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { className: toneClass, icon } = TONES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md border px-4 py-3', toneClass, className)}
    >
      <Icon name={icon} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 text-body-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5' : undefined}>{children}</div> : null}
      </div>
    </div>
  );
}
