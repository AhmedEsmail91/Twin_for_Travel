import 'server-only';

import { Schema } from 'mongoose';

import type { Localized, LocalizedList } from '@/types/common';

/**
 * The bilingual field shape used across every content model.
 *
 * `_id: false` keeps these as plain embedded objects rather than sub-documents with
 * their own identifiers — they are values, not entities.
 */
export function localizedField(options: { required?: boolean; maxLength?: number } = {}) {
  const { required = false, maxLength } = options;

  const stringField = {
    type: String,
    trim: true,
    default: '',
    ...(maxLength ? { maxlength: maxLength } : {}),
  };

  return {
    type: new Schema<Localized>(
      { ar: stringField, en: stringField },
      { _id: false, versionKey: false },
    ),
    required,
    default: (): Localized => ({ ar: '', en: '' }),
  };
}

export function localizedListField(options: { maxItemLength?: number } = {}) {
  const { maxItemLength = 300 } = options;

  const listField = {
    type: [{ type: String, trim: true, maxlength: maxItemLength }],
    default: (): string[] => [],
  };

  return {
    type: new Schema<LocalizedList>(
      { ar: listField, en: listField },
      { _id: false, versionKey: false },
    ),
    default: (): LocalizedList => ({ ar: [], en: [] }),
  };
}

/**
 * Shared `toJSON` transform: expose `id`, hide Mongo's internals.
 * Repositories return plain objects, so this keeps their shape consistent.
 */
export const baseToJSON = {
  virtuals: true,
  versionKey: false,
  transform(_document: unknown, record: Record<string, unknown>) {
    record.id = String(record._id);
    delete record._id;
    return record;
  },
} as const;
