/**
 * The platforms the admin can configure. Adding one here plus an icon in
 * `components/ui/Icon.tsx` is the whole change — nothing else enumerates platforms.
 */
export const SOCIAL_PLATFORMS = [
  'whatsapp',
  'facebook',
  'instagram',
  'tiktok',
  'telegram',
  'youtube',
  'x',
  'website',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  /** Optional override for the translated platform name. */
  label: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};
