import { z } from 'zod';

const localized = (max: number) =>
  z.object({
    ar: z.string().trim().max(max).default(''),
    en: z.string().trim().max(max).default(''),
  });

/** Digits, spaces, +, - and parentheses. Normalised to digits before use. */
const phone = z
  .string()
  .trim()
  .max(32, 'That number is too long')
  .refine((value) => value === '' || /^[+\d][\d\s()-]{5,}$/.test(value), 'Enter a valid phone number');

export const updateSettingsSchema = z.object({
  companyName: localized(120),
  tagline: localized(200),
  about: localized(3000),

  whatsappNumber: phone,
  whatsappMessage: localized(300),

  contactPhone: phone,
  contactEmail: z
    .string()
    .trim()
    .max(254)
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Enter a valid email address'),
  address: localized(300),
  workingHours: localized(200),
  mapUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === '' || /^https?:\/\//.test(value), 'Enter a full URL starting with https://'),

  seoTitle: localized(120),
  seoDescription: localized(300),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
