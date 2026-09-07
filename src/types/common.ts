import type { Locale } from '@/i18n/routing';

/** Every translatable content field in the database uses this shape. */
export type Localized = { ar: string; en: string };

export type LocalizedList = { ar: string[]; en: string[] };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type { Locale };
