import { z } from 'zod';

import { SOCIAL_PLATFORMS } from './social.types';

/**
 * URLs are restricted to http(s) so a stored `javascript:` value can never end up in
 * an `href`. CLAUDE.md §16.
 */
const httpUrl = z
  .string()
  .trim()
  .min(1, 'Enter a URL')
  .max(500, 'That URL is too long')
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Enter a full URL starting with https://');

export const createSocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS, { error: 'Choose a platform' }),
  url: httpUrl,
  label: z.string().trim().max(60).default(''),
  enabled: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
});

/**
 * Declared without defaults rather than as `createSocialLinkSchema.partial()`:
 * `.partial()` keeps a field's `.default()`, so a PATCH toggling `enabled` would
 * also reset the label and the display order. See trip.schema.ts for the same note.
 */
export const updateSocialLinkSchema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS, { error: 'Choose a platform' }).optional(),
    url: httpUrl.optional(),
    label: z.string().trim().max(60).optional(),
    enabled: z.boolean().optional(),
    displayOrder: z.coerce.number().int().min(0).max(999).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
