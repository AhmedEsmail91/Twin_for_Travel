import 'server-only';

import { Schema, model, models, type Model, type Types } from 'mongoose';

import { baseSerialisation, localizedField } from '@/lib/db/schema-helpers';
import type { Localized } from '@/types/common';

/**
 * A singleton document, pinned by `key: 'site'` with a unique index, so a stray
 * insert can never create a second settings row.
 */
export const SITE_SETTINGS_KEY = 'site';

export type SiteSettingsDocument = {
  _id: Types.ObjectId;
  key: string;

  companyName: Localized;
  tagline: Localized;
  about: Localized;

  whatsappNumber: string;
  whatsappMessage: Localized;

  contactPhone: string;
  contactEmail: string;
  address: Localized;
  workingHours: Localized;
  mapUrl: string;

  seoTitle: Localized;
  seoDescription: Localized;

  createdAt: Date;
  updatedAt: Date;
};

const settingsSchema = new Schema<SiteSettingsDocument>(
  {
    key: { type: String, required: true, default: SITE_SETTINGS_KEY },

    companyName: localizedField({ maxLength: 120 }),
    tagline: localizedField({ maxLength: 200 }),
    about: localizedField({ maxLength: 3000 }),

    whatsappNumber: { type: String, default: '', trim: true, maxlength: 32 },
    whatsappMessage: localizedField({ maxLength: 300 }),

    contactPhone: { type: String, default: '', trim: true, maxlength: 32 },
    contactEmail: { type: String, default: '', trim: true, lowercase: true, maxlength: 254 },
    address: localizedField({ maxLength: 300 }),
    workingHours: localizedField({ maxLength: 200 }),
    mapUrl: { type: String, default: '', trim: true, maxlength: 500 },

    seoTitle: localizedField({ maxLength: 120 }),
    seoDescription: localizedField({ maxLength: 300 }),
  },
  { timestamps: true, toJSON: baseSerialisation, toObject: baseSerialisation },
);

settingsSchema.index({ key: 1 }, { unique: true });

export const SiteSettingsModel: Model<SiteSettingsDocument> =
  (models.SiteSettings as Model<SiteSettingsDocument>) ??
  model<SiteSettingsDocument>('SiteSettings', settingsSchema);
