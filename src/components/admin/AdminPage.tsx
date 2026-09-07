import type { ReactNode } from 'react';

/** The standard admin page frame: title, optional description, optional action. */
export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h2 font-bold text-navy">{title}</h1>
          {description ? <p className="mt-1.5 text-body-sm text-ink-soft">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      {children}
    </div>
  );
}
