'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { CONTROL_CLASS } from './Field';
import { cn } from '@/lib/utils/cn';

export function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  return <input className={cn(CONTROL_CLASS, className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentPropsWithoutRef<'textarea'>) {
  return <textarea rows={rows} className={cn(CONTROL_CLASS, 'resize-y', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentPropsWithoutRef<'select'>) {
  return (
    <select className={cn(CONTROL_CLASS, 'cursor-pointer appearance-none pe-9', className)} {...props}>
      {children}
    </select>
  );
}

/** A labelled checkbox row — used for publish/feature toggles in the admin. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: ComponentPropsWithoutRef<'input'> & { label: string; description?: string }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border border-sand bg-surface p-3 transition-colors duration-150 hover:border-gold/50',
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-body-sm font-semibold text-navy">{label}</span>
        {description ? <span className="block text-caption text-ink-soft">{description}</span> : null}
      </span>
    </label>
  );
}
