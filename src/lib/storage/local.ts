import 'server-only';

import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '@/config/env';
import { AppError } from '@/lib/http/errors';
import type { StorageProvider, StoredFile, UploadInput } from './types';

/**
 * Development storage.
 *
 * Writes into `UPLOAD_DIR` (inside `public/`) so Next serves the files statically.
 * Deliberately isolated: a serverless deployment has an ephemeral, read-only-ish
 * filesystem, so production must use an object store. `getStorageProvider()` warns
 * when this provider is selected in production.
 */

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';

  /*
   * `turbopackIgnore` stops the bundler tracing this dynamic path, which would
   * otherwise pull the entire project (including `public/`) into the server output.
   * The provider is development-only, so nothing is lost. See the class comment.
   */
  private readonly rootDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), env.UPLOAD_DIR);

  /** URL path the files are served from, derived from the directory under `public/`. */
  private readonly publicPrefix = `/${env.UPLOAD_DIR.replace(/^public\/?/, '').replace(/^\/+|\/+$/g, '')}`;

  async upload(input: UploadInput): Promise<StoredFile> {
    const extension = EXTENSION_BY_TYPE[input.contentType] ?? 'bin';
    const key = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${extension}`;
    const destination = path.join(this.rootDir, key);

    // Refuse anything that would escape the upload directory.
    if (!destination.startsWith(this.rootDir + path.sep)) {
      throw new AppError('STORAGE_ERROR', 'Invalid upload destination', 500);
    }

    await mkdir(this.rootDir, { recursive: true });
    await writeFile(destination, input.data);

    return {
      url: this.getUrl(key),
      key,
      width: input.width,
      height: input.height,
      bytes: input.data.byteLength,
      contentType: input.contentType,
    };
  }

  async delete(key: string): Promise<void> {
    const safeKey = path.basename(key);
    const target = path.join(this.rootDir, safeKey);

    try {
      await unlink(target);
    } catch (error) {
      // Already gone is a success as far as the caller is concerned.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  getUrl(key: string): string {
    return `${this.publicPrefix}/${path.basename(key)}`;
  }
}
