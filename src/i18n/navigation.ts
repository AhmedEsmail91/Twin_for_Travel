import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware replacements for `next/link` and the navigation hooks.
 * Always import `Link`, `redirect`, `usePathname` and `useRouter` from here on the
 * public site so locale prefixes are handled automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
