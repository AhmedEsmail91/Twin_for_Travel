'use client';

import { useId, useState } from 'react';

import { Input, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import type { Localized } from '@/types/common';

type Language = 'ar' | 'en';

const LANGUAGES: { code: Language; label: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

/**
 * One bilingual content field, with a tab per language.
 *
 * Arabic is first because it is the site's default locale, and the Arabic input is
 * `dir="rtl"` so the editor types in the direction the visitor will read.
 * The other language's content is kept mounted, so switching tabs never loses a
 * half-typed draft.
 */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 5,
  hint,
  error,
  required = false,
  placeholder,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: { ar?: string; en?: string };
}) {
  const id = useId();
  const [active, setActive] = useState<Language>('ar');
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  const Control = multiline ? Textarea : Input;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption font-semibold text-navy">
          {label}
          {required ? (
            <span className="text-danger ms-1" aria-hidden>
              *
            </span>
          ) : null}
        </span>

        <div role="tablist" aria-label={`${label} language`} className="flex gap-1">
          {LANGUAGES.map((language) => {
            const isActive = language.code === active;
            const filled = value[language.code]?.trim().length > 0;

            return (
              <button
                key={language.code}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${id}-${language.code}`}
                onClick={() => setActive(language.code)}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-caption font-semibold transition-colors duration-150',
                  isActive
                    ? 'bg-navy text-cream'
                    : 'bg-surface-sunk text-ink-soft hover:text-navy',
                )}
              >
                {language.label}
                {/* A quiet dot marks which language already has content. */}
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    filled ? 'bg-success' : isActive ? 'bg-cream/40' : 'bg-sand-muted',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {LANGUAGES.map((language) => (
        <div
          key={language.code}
          id={`${id}-${language.code}`}
          role="tabpanel"
          hidden={language.code !== active}
        >
          <Control
            id={language.code === active ? id : undefined}
            dir={language.dir}
            lang={language.code}
            rows={multiline ? rows : undefined}
            value={value[language.code] ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
              onChange({ ...value, [language.code]: event.target.value })
            }
            placeholder={placeholder?.[language.code]}
            aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
            aria-invalid={error ? true : undefined}
          />
        </div>
      ))}

      {hint && !error ? (
        <p id={hintId} className="text-caption text-ink-soft">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A bilingual list — included services, activities, notes. Entries are edited as one
 * line each, which is how the admin thinks about them and how they render.
 */
export function BilingualListField({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: { ar: string[]; en: string[] };
  onChange: (value: { ar: string[]; en: string[] }) => void;
  hint?: string;
  placeholder?: { ar?: string; en?: string };
}) {
  const asText: Localized = {
    ar: value.ar.join('\n'),
    en: value.en.join('\n'),
  };

  return (
    <BilingualField
      label={label}
      value={asText}
      multiline
      rows={5}
      hint={hint ?? 'One item per line.'}
      placeholder={placeholder}
      onChange={(next) =>
        onChange({
          ar: splitLines(next.ar),
          en: splitLines(next.en),
        })
      }
    />
  );
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
