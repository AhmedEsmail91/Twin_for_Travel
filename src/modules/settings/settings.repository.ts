import 'server-only';

import { connectToDatabase } from '@/lib/db/mongoose';
import { SITE_SETTINGS_KEY, SiteSettingsModel, type SiteSettingsDocument } from './settings.model';
import type { SiteSettings } from './settings.types';
import type { UpdateSettingsInput } from './settings.schema';

function toSettings(document: SiteSettingsDocument): SiteSettings {
  return {
    id: String(document._id),

    companyName: localized(document.companyName),
    tagline: localized(document.tagline),
    about: localized(document.about),

    whatsappNumber: document.whatsappNumber ?? '',
    whatsappMessage: localized(document.whatsappMessage),

    contactPhone: document.contactPhone ?? '',
    contactEmail: document.contactEmail ?? '',
    address: localized(document.address),
    workingHours: localized(document.workingHours),
    mapUrl: document.mapUrl ?? '',

    seoTitle: localized(document.seoTitle),
    seoDescription: localized(document.seoDescription),

    updatedAt: document.updatedAt.toISOString(),
  };
}

function localized(value: { ar?: string; en?: string } | undefined) {
  return { ar: value?.ar ?? '', en: value?.en ?? '' };
}

export async function findSettings(): Promise<SiteSettings | null> {
  await connectToDatabase();
  const document = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY })
    .lean<SiteSettingsDocument>()
    .exec();
  return document ? toSettings(document) : null;
}

/** Upsert keyed on the singleton key — never creates a second document. */
export async function upsertSettings(input: UpdateSettingsInput): Promise<SiteSettings> {
  await connectToDatabase();

  const document = await SiteSettingsModel.findOneAndUpdate(
    { key: SITE_SETTINGS_KEY },
    { $set: { ...input, key: SITE_SETTINGS_KEY } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
    .lean<SiteSettingsDocument>()
    .exec();

  return toSettings(document);
}
