'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ApiClientError, api } from '@/lib/http/client';
import { cn } from '@/lib/utils/cn';
import type { TripStatus, TripWithDerived } from '@/modules/trips/trip.types';

/**
 * The trip management table.
 *
 * Filtering and sorting run client-side over the full list. The dataset is a
 * travel company's trip catalogue — tens, not tens of thousands — so shipping it
 * once and filtering instantly beats a round trip per keystroke. If it ever grows
 * past a few hundred, the repository already supports server-side paging.
 * CLAUDE.md / brief §52.
 */

const STATUS_TONE: Record<TripStatus, BadgeTone> = {
  DRAFT: 'sand',
  UPCOMING: 'gold',
  ONGOING: 'success',
  COMPLETED: 'sand',
  CANCELLED: 'danger',
};

type SortKey = 'startDate' | 'title' | 'price';

export function TripTable({ initialTrips }: { initialTrips: TripWithDerived[] }) {
  const router = useRouter();

  const [trips, setTrips] = useState(initialTrips);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TripStatus>('all');
  const [visibility, setVisibility] = useState<'all' | 'published' | 'unpublished' | 'featured'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortAsc, setSortAsc] = useState(false);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TripWithDerived | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = trips.filter((trip) => {
      if (status !== 'all' && trip.effectiveStatus !== status) return false;
      if (visibility === 'published' && !trip.published) return false;
      if (visibility === 'unpublished' && trip.published) return false;
      if (visibility === 'featured' && !trip.featured) return false;

      if (!term) return true;
      return [trip.title.en, trip.title.ar, trip.destination.en, trip.destination.ar, trip.slug]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });

    const direction = sortAsc ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (sortKey === 'price') return (a.price - b.price) * direction;
      if (sortKey === 'title') {
        return (a.title.en || a.title.ar).localeCompare(b.title.en || b.title.ar) * direction;
      }
      return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * direction;
    });
  }, [trips, search, status, visibility, sortKey, sortAsc]);

  async function toggle(trip: TripWithDerived, field: 'published' | 'featured') {
    setPendingId(trip.id);
    setError(null);
    setNotice(null);

    try {
      const updated = await api.patch<TripWithDerived>(`/api/trips/${trip.id}`, {
        [field]: !trip[field],
      });

      setTrips((current) => current.map((entry) => (entry.id === trip.id ? updated : entry)));
      setNotice(
        `"${updated.title.en || updated.title.ar}" is now ${
          field === 'published'
            ? updated.published
              ? 'published'
              : 'unpublished'
            : updated.featured
              ? 'featured'
              : 'no longer featured'
        }.`,
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.displayMessage
          : 'Could not update the trip. Please try again.',
      );
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setPendingId(toDelete.id);
    setError(null);

    try {
      await api.delete(`/api/trips/${toDelete.id}`);
      setTrips((current) => current.filter((entry) => entry.id !== toDelete.id));
      setNotice(`"${toDelete.title.en || toDelete.title.ar}" was deleted.`);
      setToDelete(null);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.displayMessage : 'Could not delete the trip.',
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Search trips</span>
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-sand-muted start-3"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, destination or slug"
            className="ps-10"
            type="search"
          />
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </label>

        <label>
          <span className="sr-only">Filter by visibility</span>
          <Select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as typeof visibility)}
          >
            <option value="all">All trips</option>
            <option value="published">Published only</option>
            <option value="unpublished">Unpublished only</option>
            <option value="featured">Featured only</option>
          </Select>
        </label>
      </div>

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={trips.length === 0 ? 'plane' : 'search'}
          title={trips.length === 0 ? 'No trips yet' : 'No trips match these filters'}
          body={
            trips.length === 0
              ? 'Create your first trip to publish it on the site.'
              : 'Try a different search term or clear the filters.'
          }
          action={
            trips.length === 0 ? (
              <Button as={Link} href="/admin/trips/create" variant="primary">
                Create a trip
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setVisibility('all');
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="u-scroll-x rounded-lg border border-sand bg-surface">
          <table className="w-full min-w-[56rem] border-collapse text-body-sm">
            <caption className="sr-only">
              Trips, {visible.length} of {trips.length} shown
            </caption>

            <thead>
              <tr className="border-b border-sand bg-surface-sunk text-caption">
                <SortableHeader
                  label="Trip"
                  active={sortKey === 'title'}
                  ascending={sortAsc}
                  onClick={() => {
                    setSortKey('title');
                    setSortAsc(sortKey === 'title' ? !sortAsc : true);
                  }}
                />
                <th scope="col" className="px-4 py-3 text-start font-semibold text-ink-soft">
                  Status
                </th>
                <SortableHeader
                  label="Departure"
                  active={sortKey === 'startDate'}
                  ascending={sortAsc}
                  onClick={() => {
                    setSortKey('startDate');
                    setSortAsc(sortKey === 'startDate' ? !sortAsc : true);
                  }}
                />
                <SortableHeader
                  label="Price"
                  active={sortKey === 'price'}
                  ascending={sortAsc}
                  onClick={() => {
                    setSortKey('price');
                    setSortAsc(sortKey === 'price' ? !sortAsc : true);
                  }}
                />
                <th scope="col" className="px-4 py-3 text-start font-semibold text-ink-soft">
                  Seats
                </th>
                <th scope="col" className="px-4 py-3 text-start font-semibold text-ink-soft">
                  Visibility
                </th>
                <th scope="col" className="px-4 py-3 text-end font-semibold text-ink-soft">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-sand">
              {visible.map((trip) => {
                const busy = pendingId === trip.id;

                return (
                  <tr key={trip.id} className={cn('transition-opacity', busy && 'opacity-55')}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trips/${trip.id}/edit`}
                        className="font-semibold text-navy hover:text-gold-dark hover:underline"
                      >
                        {trip.title.en || trip.title.ar}
                      </Link>
                      <span className="block text-caption text-ink-soft">/{trip.slug}</span>
                    </td>

                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[trip.effectiveStatus]}>{trip.effectiveStatus}</Badge>
                    </td>

                    <td className="u-numeric px-4 py-3 text-ink-soft">
                      {trip.startDate.slice(0, 10)}
                    </td>

                    <td className="u-numeric px-4 py-3 font-semibold text-navy">
                      {trip.price.toLocaleString('en-US')} {trip.currency}
                    </td>

                    <td className="u-numeric px-4 py-3 text-ink-soft">
                      {trip.availableSeats}/{trip.capacity}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <ToggleChip
                          active={trip.published}
                          disabled={busy}
                          onClick={() => toggle(trip, 'published')}
                          activeLabel="Published"
                          inactiveLabel="Draft"
                        />
                        <ToggleChip
                          active={trip.featured}
                          disabled={busy}
                          onClick={() => toggle(trip, 'featured')}
                          activeLabel="Featured"
                          inactiveLabel="Not featured"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/trips/${trip.id}/edit`}
                          className="rounded-md p-2 text-ink-soft transition-colors duration-150 hover:bg-surface-sunk hover:text-navy"
                          aria-label={`Edit ${trip.title.en || trip.title.ar}`}
                        >
                          <Icon name="image" size={17} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setToDelete(trip)}
                          disabled={busy}
                          aria-label={`Delete ${trip.title.en || trip.title.ar}`}
                          className="rounded-md p-2 text-ink-soft transition-colors duration-150 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        >
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        pending={pendingId === toDelete?.id}
        title="Delete this trip?"
        description={
          toDelete
            ? `"${toDelete.title.en || toDelete.title.ar}" will be permanently removed, along with its gallery references. This cannot be undone.`
            : ''
        }
      />
    </div>
  );
}

function SortableHeader({
  label,
  active,
  ascending,
  onClick,
}: {
  label: string;
  active: boolean;
  ascending: boolean;
  onClick: () => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={active ? (ascending ? 'ascending' : 'descending') : 'none'}
      className="px-4 py-3 text-start font-semibold text-ink-soft"
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 hover:text-navy"
      >
        {label}
        <Icon
          name="chevronDown"
          size={14}
          className={cn(
            'transition-transform duration-150',
            active ? (ascending ? 'rotate-180 text-gold-dark' : 'text-gold-dark') : 'opacity-35',
          )}
        />
      </button>
    </th>
  );
}

function ToggleChip({
  active,
  disabled,
  onClick,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'rounded-sm border px-2 py-1 text-caption font-semibold transition-colors duration-150 disabled:opacity-50',
        active
          ? 'border-success/40 bg-success/12 text-success'
          : 'border-sand bg-surface-sunk text-ink-soft hover:border-gold/50',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
