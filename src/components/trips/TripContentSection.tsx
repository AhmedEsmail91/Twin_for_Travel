import { Icon, type IconName } from '@/components/ui/Icon';

/**
 * A titled block on the trip page, with the gold medallion the reference uses to
 * mark each information group.
 */
export function TripContentSection({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-sand pt-8">
      <h2 className="mb-4 flex items-center gap-3 text-h3 font-display text-navy">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold-dark">
          <Icon name={icon} size={18} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The included/excluded/notes lists. `variant` swaps the marker: a check for what
 * the price covers, a cross for what it doesn't, a star for everything else.
 */
export function TripList({
  items,
  variant = 'neutral',
}: {
  items: string[];
  variant?: 'included' | 'excluded' | 'neutral';
}) {
  const markers = {
    included: { icon: 'check' as IconName, className: 'text-success' },
    excluded: { icon: 'cross' as IconName, className: 'text-danger' },
    neutral: { icon: 'star' as IconName, className: 'text-gold-dark' },
  } as const;

  const marker = markers[variant];

  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2.5 text-body-sm text-ink-soft">
          <Icon name={marker.icon} size={17} className={`mt-0.5 shrink-0 ${marker.className}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Renders admin-entered prose. Line breaks are preserved; no HTML is interpreted. */
export function TripProse({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-body text-ink-soft">
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
    </div>
  );
}
