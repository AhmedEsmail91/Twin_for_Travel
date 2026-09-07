'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

/**
 * Client-side only because it reads the current path to mark the active item.
 * `aria-current="page"` carries that state to assistive technology; the gold
 * underline is the visual half of the same signal.
 */
export function NavLink({
  href,
  label,
  onNavigate,
  variant = 'header',
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  variant?: 'header' | 'drawer';
}) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  if (variant === 'drawer') {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center justify-between rounded-md px-4 py-3 text-body font-semibold transition-colors duration-150',
          isActive ? 'bg-cream/12 text-gold-light' : 'text-cream/85 hover:bg-cream/8 hover:text-cream',
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative rounded-md px-3 py-2 text-body-sm font-semibold transition-colors duration-150',
        'after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition-transform after:duration-200',
        isActive ? 'text-gold-light after:scale-x-100' : 'text-cream/80 hover:text-cream hover:after:scale-x-100',
      )}
    >
      {label}
    </Link>
  );
}
