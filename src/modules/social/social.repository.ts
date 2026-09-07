import 'server-only';

import type { QueryFilter } from 'mongoose';

import { connectToDatabase } from '@/lib/db/mongoose';
import { SocialLinkModel, type SocialLinkDocument } from './social.model';
import type { SocialLink, SocialPlatform } from './social.types';
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from './social.schema';

function toSocialLink(document: SocialLinkDocument): SocialLink {
  return {
    id: String(document._id),
    platform: document.platform,
    url: document.url,
    label: document.label ?? '',
    enabled: document.enabled,
    displayOrder: document.displayOrder,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function findSocialLinks(
  options: { enabledOnly?: boolean } = {},
): Promise<SocialLink[]> {
  await connectToDatabase();

  const filter: QueryFilter<SocialLinkDocument> = {};
  if (options.enabledOnly) filter.enabled = true;

  const documents = await SocialLinkModel.find(filter)
    .sort({ displayOrder: 1, platform: 1 })
    .lean<SocialLinkDocument[]>()
    .exec();

  return documents.map(toSocialLink);
}

export async function findSocialLinkByPlatform(
  platform: SocialPlatform,
): Promise<SocialLink | null> {
  await connectToDatabase();
  const document = await SocialLinkModel.findOne({ platform }).lean<SocialLinkDocument>().exec();
  return document ? toSocialLink(document) : null;
}

export async function insertSocialLink(input: CreateSocialLinkInput): Promise<SocialLink> {
  await connectToDatabase();
  const document = await SocialLinkModel.create(input);
  return toSocialLink(document.toObject() as SocialLinkDocument);
}

export async function updateSocialLinkById(
  id: string,
  input: UpdateSocialLinkInput,
): Promise<SocialLink | null> {
  await connectToDatabase();
  if (!isObjectId(id)) return null;

  const document = await SocialLinkModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  )
    .lean<SocialLinkDocument>()
    .exec();

  return document ? toSocialLink(document) : null;
}

export async function deleteSocialLinkById(id: string): Promise<SocialLink | null> {
  await connectToDatabase();
  if (!isObjectId(id)) return null;
  const document = await SocialLinkModel.findByIdAndDelete(id).lean<SocialLinkDocument>().exec();
  return document ? toSocialLink(document) : null;
}

function isObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}
