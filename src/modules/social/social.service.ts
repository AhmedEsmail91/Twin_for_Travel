import 'server-only';

import { cache } from 'react';

import { ConflictError, NotFoundError } from '@/lib/http/errors';
import * as repository from './social.repository';
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from './social.schema';
import type { SocialLink } from './social.types';

/**
 * Social links.
 *
 * Like site settings, the public read path degrades to an empty list rather than
 * failing the page — a missing social menu is a smaller problem than a 500.
 */
export const getEnabledSocialLinks = cache(async (): Promise<SocialLink[]> => {
  try {
    return await repository.findSocialLinks({ enabledOnly: true });
  } catch (error) {
    console.error('[social] failed to load social links', error);
    return [];
  }
});

export async function listSocialLinks(): Promise<SocialLink[]> {
  return repository.findSocialLinks();
}

export async function createSocialLink(input: CreateSocialLinkInput): Promise<SocialLink> {
  const existing = await repository.findSocialLinkByPlatform(input.platform);
  if (existing) {
    throw new ConflictError(`A ${input.platform} link already exists. Edit it instead.`);
  }

  return repository.insertSocialLink(input);
}

export async function updateSocialLink(
  id: string,
  input: UpdateSocialLinkInput,
): Promise<SocialLink> {
  if (input.platform) {
    const clash = await repository.findSocialLinkByPlatform(input.platform);
    if (clash && clash.id !== id) {
      throw new ConflictError(`A ${input.platform} link already exists. Edit it instead.`);
    }
  }

  const updated = await repository.updateSocialLinkById(id, input);
  if (!updated) throw new NotFoundError('Social link not found', 'SOCIAL_LINK_NOT_FOUND');
  return updated;
}

export async function deleteSocialLink(id: string): Promise<SocialLink> {
  const deleted = await repository.deleteSocialLinkById(id);
  if (!deleted) throw new NotFoundError('Social link not found', 'SOCIAL_LINK_NOT_FOUND');
  return deleted;
}
