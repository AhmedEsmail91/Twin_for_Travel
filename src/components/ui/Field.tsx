'use client';

import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Label + control + help + error, wired together.
 *
 * The generated id links the label, the description and the error to the control,
 * so a screen reader announces "Price, required, Enter a price" rather than an
 * unlabelled box. Every form control in the project goes through this. CLAUDE.md §53.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-caption font-semibold text-navy">
        {label}
        {required ? (
          <span className="text-danger ms-1" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}

      {hint && !error ? (
        <p id={hintId} className="text-caption text-ink-soft">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const CONTROL_CLASS =
  'w-full rounded-md border border-sand bg-surface px-3 py-2.5 text-body-sm text-ink ' +
  'shadow-inset-sunk transition-colors duration-150 placeholder:text-sand-muted ' +
  'focus:border-gold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 ' +
  'focus-visible:outline-gold-dark disabled:cursor-not-allowed disabled:bg-surface-sunk ' +
  'aria-[invalid=true]:border-danger';
