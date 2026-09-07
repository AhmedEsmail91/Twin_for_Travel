import 'server-only';

import { cache } from 'react';

import * as repository from './settings.repository';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from './settings.types';
import type { UpdateSettingsInput } from './settings.schema';

/**
 * Site settings.
 *
 * `getSiteSettings` never throws and never returns null: the public site renders on
 * every request, including the very first one before an admin has saved anything,
 * and including a moment when the database is unreachable. A missing WhatsApp number
 * hides the button; it does not take the site down.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return (await repository.findSettings()) ?? DEFAULT_SITE_SETTINGS;
  } catch (error) {
    console.error('[settings] failed to load site settings, using defaults', error);
    return DEFAULT_SITE_SETTINGS;
  }
});

/** Admin path — failures here must surface, so this one is not swallowed. */
export async function updateSiteSettings(input: UpdateSettingsInput): Promise<SiteSettings> {
  return repository.upsertSettings(input);
}

export async function getSiteSettingsForAdmin(): Promise<SiteSettings> {
  return (await repository.findSettings()) ?? DEFAULT_SITE_SETTINGS;
}
