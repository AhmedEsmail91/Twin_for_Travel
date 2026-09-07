import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Variants map to the brand's roles, not to abstract colours:
 * `primary` is the navy call to action, `gold` the accented one, `outline` and
 * `ghost` the quiet ones, `onDark` the version used inside navy bands.
 */
export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'onDark' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors ' +
  'duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-55 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-cream hover:bg-navy-light focus-visible:outline-gold-dark',
  gold: 'bg-gold text-navy hover:bg-gold-light focus-visible:outline-navy',
  outline:
    'border border-gold/60 bg-transparent text-navy hover:border-gold hover:bg-gold/10 focus-visible:outline-gold-dark',
  ghost: 'bg-transparent text-navy hover:bg-navy/8 focus-visible:outline-gold-dark',
  onDark:
    'border border-cream/35 bg-transparent text-cream hover:border-cream/70 hover:bg-cream/10 focus-visible:outline-gold-light',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-caption',
  md: 'h-11 px-5 text-body-sm',
  lg: 'h-13 px-7 text-body',
};

type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

/**
 * Polymorphic so a link that looks like a button stays an `<a>`. Rendering a
 * navigation control as a `<button>` breaks middle-click, keyboard and screen
 * reader expectations.
 */
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;

  return (
    <Component
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
