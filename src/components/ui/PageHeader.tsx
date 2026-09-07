import type { ReactNode } from 'react';

import { Container } from './Container';

/**
 * The navy band that opens every inner page — the reference's title block,
 * with its gold eyebrow and hairline.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-gold/25 bg-navy">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_0%,rgba(193,146,88,0.18),transparent_65%)]"
      />

      <Container className="relative">
        <div className="max-w-3xl py-14 sm:py-18">
          {eyebrow ? (
            <p className="u-label mb-4 flex items-center gap-3 text-gold-light">
              <span aria-hidden className="u-gold-rule h-px w-8 shrink-0" />
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-h1 font-display text-cream">{title}</h1>

          {subtitle ? <p className="mt-4 text-body text-cream/75">{subtitle}</p> : null}

          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
