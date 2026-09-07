import 'server-only';

import { Schema, model, models, type Model, type Types } from 'mongoose';

import { baseToJSON } from '@/lib/db/schema-helpers';
import { SOCIAL_PLATFORMS, type SocialPlatform } from './social.types';

export type SocialLinkDocument = {
  _id: Types.ObjectId;
  platform: SocialPlatform;
  url: string;
  label: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const socialLinkSchema = new Schema<SocialLinkDocument>(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    label: { type: String, default: '', trim: true, maxlength: 60 },
    enabled: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 999 },
  },
  { timestamps: true, toJSON: baseToJSON, toObject: baseToJSON },
);

// One entry per platform keeps the admin list unambiguous.
socialLinkSchema.index({ platform: 1 }, { unique: true });

// The public menu's query: enabled links in display order.
socialLinkSchema.index({ enabled: 1, displayOrder: 1 });

export const SocialLinkModel: Model<SocialLinkDocument> =
  (models.SocialLink as Model<SocialLinkDocument>) ??
  model<SocialLinkDocument>('SocialLink', socialLinkSchema);
