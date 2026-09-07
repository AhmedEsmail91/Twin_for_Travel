import 'server-only';

import type { NextResponse } from 'next/server';

import { ok, type ApiSuccess } from '@/lib/http/response';
import { requireAdmin } from '@/modules/auth/auth.service';
import { updateSettingsSchema } from './settings.schema';
import * as service from './settings.service';
import type { SiteSettings } from './settings.types';

export async function handleGetSettings(): Promise<NextResponse<ApiSuccess<SiteSettings>>> {
  return ok(await service.getSiteSettingsForAdmin());
}

export async function handleUpdateSettings(
  request: Request,
): Promise<NextResponse<ApiSuccess<SiteSettings>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const input = updateSettingsSchema.parse(body);

  return ok(await service.updateSiteSettings(input));
}
