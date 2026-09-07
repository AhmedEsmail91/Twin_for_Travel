/**
 * The storage contract.
 *
 * Business code depends on this interface only. Swapping `STORAGE_PROVIDER` must not
 * require a change anywhere in `modules/trips` or the admin UI. CLAUDE.md §15.
 */

export type StoredFile = {
  /** Public URL the browser loads. */
  url: string;
  /** Provider handle used to delete the object later (path, public_id, key…). */
  key: string;
  width: number;
  height: number;
  bytes: number;
  contentType: string;
};

export type UploadInput = {
  data: Buffer;
  /** Original filename, used only to derive a readable stored name. */
  filename: string;
  contentType: string;
  width: number;
  height: number;
};

export interface StorageProvider {
  readonly name: string;
  upload(input: UploadInput): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
