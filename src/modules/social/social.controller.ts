import 'server-only';

import type { NextResponse } from 'next/server';

import { created, ok, type ApiSuccess } from '@/lib/http/response';
import { requireAdmin } from '@/modules/auth/auth.service';
import { createSocialLinkSchema, updateSocialLinkSchema } from './social.schema';
import * as service from './social.service';
import type { SocialLink } from './social.types';

export async function handleListSocialLinks(
  request: Request,
): Promise<NextResponse<ApiSuccess<SocialLink[]>>> {
  const enabledOnly = new URL(request.url).searchParams.get('enabled') === 'true';

  // The full list, including disabled entries, is admin-only.
  if (!enabledOnly) await requireAdmin();

  const links = enabledOnly ? await service.getEnabledSocialLinks() : await service.listSocialLinks();
  return ok(links);
}

export async function handleCreateSocialLink(
  request: Request,
): Promise<NextResponse<ApiSuccess<SocialLink>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const input = createSocialLinkSchema.parse(body);

  return created(await service.createSocialLink(input));
}

export async function handleUpdateSocialLink(
  request: Request,
  id: string,
): Promise<NextResponse<ApiSuccess<SocialLink>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const input = updateSocialLinkSchema.parse(body);

  return ok(await service.updateSocialLink(id, input));
}

export async function handleDeleteSocialLink(
  id: string,
): Promise<NextResponse<ApiSuccess<{ id: string }>>> {
  await requireAdmin();

  const deleted = await service.deleteSocialLink(id);
  return ok({ id: deleted.id });
}
