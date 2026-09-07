import 'server-only';

import { env, isProduction } from '@/config/env';
import { CloudinaryStorageProvider } from './cloudinary';
import { LocalStorageProvider } from './local';
import type { StorageProvider } from './types';

export type { StorageProvider, StoredFile, UploadInput } from './types';

let provider: StorageProvider | null = null;

/**
 * Resolves the configured provider once per process.
 *
 * This is the only place a concrete provider is constructed. Nothing in
 * `modules/` or `components/` may import `LocalStorageProvider` or
 * `CloudinaryStorageProvider` directly.
 */
export function getStorageProvider(): StorageProvider {
  if (provider) return provider;

  if (env.STORAGE_PROVIDER === 'cloudinary') {
    provider = new CloudinaryStorageProvider();
  } else {
    if (isProduction) {
      console.warn(
        '[storage] STORAGE_PROVIDER=local in production. Uploaded files live on the ' +
          'instance filesystem and will be lost on redeploy. Configure Cloudinary instead.',
      );
    }
    provider = new LocalStorageProvider();
  }

  return provider;
}
