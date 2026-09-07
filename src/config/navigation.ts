import type { IconName } from '@/components/ui/Icon';

/**
 * The site's navigation. One definition drives the header, the mobile menu and the
 * footer, so a new page cannot appear in one and be forgotten in another.
 *
 * `labelKey` resolves against the `nav` message namespace.
 */
export type NavItem = { href: string; labelKey: string };

export const MAIN_NAV: NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/trips', labelKey: 'trips' },
  { href: '/previous-trips', labelKey: 'previousTrips' },
  { href: '/about', labelKey: 'about' },
  { href: '/contact', labelKey: 'contact' },
];

/** Homepage "why us" pillars — copy lives in the message catalogues. */
export const VALUE_PILLARS: { key: string; icon: IconName }[] = [
  { key: 'transport', icon: 'car' },
  { key: 'guides', icon: 'headset' },
  { key: 'pricing', icon: 'wallet' },
  { key: 'support', icon: 'shield' },
];
