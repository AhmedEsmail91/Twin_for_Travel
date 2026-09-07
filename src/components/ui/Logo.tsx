import Image from 'next/image';

import { SITE } from '@/config/site';
import { cn } from '@/lib/utils/cn';

/**
 * The logo is an image asset, never redrawn in CSS or type, and never stretched:
 * the box is square because the badge is square. CLAUDE.md §24.
 */
export function Logo({
  size = 44,
  companyName,
  className,
  priority = false,
}: {
  size?: number;
  companyName: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={SITE.logo.src}
      alt={companyName}
      width={size}
      height={size}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
      style={{ width: size, height: size }}
      sizes={`${size}px`}
    />
  );
}
