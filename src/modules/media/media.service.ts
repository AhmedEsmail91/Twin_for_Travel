import 'server-only';

import path from 'node:path';

import {
  BadRequestError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from '@/lib/http/errors';
import { getStorageProvider, type StoredFile } from '@/lib/storage';
import { inspectImage } from './image-inspect';

/**
 * Upload validation and storage.
 *
 * Nothing about an uploaded file is trusted: the extension, the declared MIME type
 * and the reported size are all checked, and the bytes themselves must agree.
 * CLAUDE.md §15, §38.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const MIN_DIMENSION = 200;
export const MAX_DIMENSION = 8000;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

export const ACCEPT_ATTRIBUTE = [...ALLOWED_TYPES].join(',');

export async function uploadImage(file: File): Promise<StoredFile> {
  if (file.size === 0) throw new BadRequestError('The selected file is empty');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new PayloadTooLargeError(
      `Images must be ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB or smaller`,
    );
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new UnsupportedMediaTypeError('Use a JPG, PNG, WebP or AVIF image');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UnsupportedMediaTypeError('Use a JPG, PNG, WebP or AVIF image');
  }

  const data = Buffer.from(await file.arrayBuffer());

  // Re-check after reading: `file.size` is a client-reported value.
  if (data.byteLength > MAX_UPLOAD_BYTES) {
    throw new PayloadTooLargeError('That image is too large');
  }

  const info = inspectImage(new Uint8Array(data));
  if (!info) {
    throw new UnsupportedMediaTypeError('That file is not a readable image');
  }

  // The bytes must be the type the client claimed — no PHP renamed to .jpg.
  if (info.contentType !== file.type) {
    throw new UnsupportedMediaTypeError('The file contents do not match its type');
  }

  if (info.width < MIN_DIMENSION || info.height < MIN_DIMENSION) {
    throw new BadRequestError(
      `Images must be at least ${MIN_DIMENSION}×${MIN_DIMENSION} pixels`,
    );
  }

  if (info.width > MAX_DIMENSION || info.height > MAX_DIMENSION) {
    throw new BadRequestError(`Images must be no larger than ${MAX_DIMENSION} pixels on a side`);
  }

  return getStorageProvider().upload({
    data,
    filename: sanitiseFilename(file.name),
    contentType: info.contentType,
    width: info.width,
    height: info.height,
  });
}

export async function deleteImage(key: string): Promise<void> {
  if (!key.trim()) throw new BadRequestError('An image key is required');
  await getStorageProvider().delete(key);
}

/** Keeps a readable name for the provider without letting a path through. */
function sanitiseFilename(name: string): string {
  return path
    .basename(name)
    .replace(/[^\w.-]+/g, '-')
    .slice(0, 100);
}
