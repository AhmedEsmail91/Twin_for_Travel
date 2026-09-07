import 'server-only';

import type { NextResponse } from 'next/server';

import { BadRequestError } from '@/lib/http/errors';
import { created, ok, type ApiSuccess } from '@/lib/http/response';
import type { StoredFile } from '@/lib/storage';
import { requireAdmin } from '@/modules/auth/auth.service';
import * as service from './media.service';

export async function handleUpload(
  request: Request,
): Promise<NextResponse<ApiSuccess<StoredFile>>> {
  await requireAdmin();

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    throw new BadRequestError('Send the image as multipart/form-data');
  }

  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    throw new BadRequestError('No file was received');
  }

  return created(await service.uploadImage(file));
}

export async function handleDelete(
  request: Request,
): Promise<NextResponse<ApiSuccess<{ deleted: true }>>> {
  await requireAdmin();

  const body: unknown = await request.json().catch(() => ({}));
  const key = (body as { key?: unknown }).key;

  if (typeof key !== 'string') throw new BadRequestError('An image key is required');

  await service.deleteImage(key);
  return ok({ deleted: true } as const);
}
