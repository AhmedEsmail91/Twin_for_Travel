'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';

/**
 * Locale-scoped error boundary.
 *
 * The visitor sees a translated, generic message; the underlying error is logged for
 * the developer and never rendered, since it can carry internal detail. CLAUDE.md §17.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.generic');

  useEffect(() => {
    console.error('[page] render failed', error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <Icon name="info" size={28} />
      </span>

      <h1 className="text-h2 font-display text-navy">{t('title')}</h1>
      <p className="mt-4 max-w-md text-body text-ink-soft">{t('body')}</p>

      <Button onClick={reset} variant="primary" className="mt-8">
        {t('cta')}
      </Button>

      {error.digest ? (
        <p className="u-numeric mt-6 text-caption text-sand-muted">{error.digest}</p>
      ) : null}
    </Container>
  );
}
