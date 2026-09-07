import { cn } from '@/lib/utils/cn';

/** Loading placeholder. Animation is suppressed by the reduced-motion rule. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-sand/60', className)} />;
}

/** The shape of a trip card, so a loading grid doesn't jump when data arrives. */
export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-sand bg-surface shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
