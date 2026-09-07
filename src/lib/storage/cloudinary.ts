import 'server-only';

import { createHash } from 'node:crypto';

import { env } from '@/config/env';
import { AppError } from '@/lib/http/errors';
import type { StorageProvider, StoredFile, UploadInput } from './types';

/**
 * Cloudinary provider.
 *
 * Uses Cloudinary's signed REST upload directly rather than their SDK: the API is two
 * endpoints, and the signature is a SHA-1 of the sorted parameters. That keeps a
 * production dependency (and its transitive tree) out of the project for no loss of
 * capability. CLAUDE.md §3.
 */

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  error?: { message?: string };
};

export class CloudinaryStorageProvider implements StorageProvider {
  readonly name = 'cloudinary';

  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly folder: string;

  constructor() {
    // `env` already refuses to load without these when the provider is selected.
    this.cloudName = env.CLOUDINARY_CLOUD_NAME as string;
    this.apiKey = env.CLOUDINARY_API_KEY as string;
    this.apiSecret = env.CLOUDINARY_API_SECRET as string;
    this.folder = env.CLOUDINARY_FOLDER;
  }

  async upload(input: UploadInput): Promise<StoredFile> {
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      folder: this.folder,
      timestamp: String(timestamp),
    };

    const form = new FormData();
    for (const [key, value] of Object.entries(params)) form.append(key, value);
    form.append('api_key', this.apiKey);
    form.append('signature', this.sign(params));
    form.append(
      'file',
      new Blob([new Uint8Array(input.data)], { type: input.contentType }),
      input.filename,
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      { method: 'POST', body: form },
    );

    const payload = (await response.json().catch(() => ({}))) as CloudinaryUploadResponse;

    if (!response.ok || !payload.secure_url || !payload.public_id) {
      // The provider's message is logged, not returned — it can contain account detail.
      console.error('[storage:cloudinary] upload failed', payload.error?.message ?? response.status);
      throw new AppError('UPLOAD_FAILED', 'The image could not be uploaded. Please try again.', 502);
    }

    return {
      url: payload.secure_url,
      key: payload.public_id,
      width: payload.width ?? input.width,
      height: payload.height ?? input.height,
      bytes: payload.bytes ?? input.data.byteLength,
      contentType: input.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = { public_id: key, timestamp: String(timestamp) };

    const form = new FormData();
    for (const [name, value] of Object.entries(params)) form.append(name, value);
    form.append('api_key', this.apiKey);
    form.append('signature', this.sign(params));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      { method: 'POST', body: form },
    );

    if (!response.ok) {
      console.error('[storage:cloudinary] delete failed', key, response.status);
      throw new AppError('STORAGE_ERROR', 'The image could not be removed.', 502);
    }
  }

  getUrl(key: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${key}`;
  }

  /** SHA-1 of `k=v` pairs sorted by key, concatenated with `&`, plus the API secret. */
  private sign(params: Record<string, string>): string {
    const canonical = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return createHash('sha1').update(`${canonical}${this.apiSecret}`).digest('hex');
  }
}
