import type { IconName } from '@/components/ui/Icon';
import type { SocialPlatform } from '@/modules/social/social.types';

/**
 * Presentation for each platform. Adding a platform means adding it here and to
 * `SOCIAL_PLATFORMS` — nowhere else enumerates them. CLAUDE.md §22.
 *
 * Brand colours are used only on hover for the floating menu, where recognising the
 * platform matters more than palette purity; everything else stays navy/gold.
 */
export const PLATFORM_ICON: Record<SocialPlatform, IconName> = {
  whatsapp: 'whatsapp',
  facebook: 'facebook',
  instagram: 'instagram',
  tiktok: 'tiktok',
  telegram: 'telegram',
  youtube: 'youtube',
  x: 'x',
  website: 'globe',
};

/** Tailwind classes for the hover state of each platform's floating button. */
export const PLATFORM_HOVER: Record<SocialPlatform, string> = {
  whatsapp: 'hover:bg-success hover:text-white hover:border-success',
  facebook: 'hover:bg-navy-light hover:text-cream hover:border-navy-light',
  instagram: 'hover:bg-gold-dark hover:text-white hover:border-gold-dark',
  tiktok: 'hover:bg-navy hover:text-cream hover:border-navy',
  telegram: 'hover:bg-navy-light hover:text-cream hover:border-navy-light',
  youtube: 'hover:bg-danger hover:text-white hover:border-danger',
  x: 'hover:bg-navy-dark hover:text-cream hover:border-navy-dark',
  website: 'hover:bg-gold hover:text-navy hover:border-gold',
};
