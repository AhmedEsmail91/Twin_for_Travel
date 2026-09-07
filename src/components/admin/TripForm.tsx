'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { BilingualField, BilingualListField } from './BilingualField';
import { ImageManager } from './ImageManager';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { ApiClientError, api } from '@/lib/http/client';
import { slugFromTitle } from '@/lib/utils/slug';
import { CURRENCIES, TRIP_STATUSES, type TripWithDerived } from '@/modules/trips/trip.types';
import type { Localized, LocalizedList } from '@/types/common';

type TripFormState = {
  title: Localized;
  slug: string;
  shortDescription: Localized;
  description: Localized;
  destination: Localized;
  location: Localized;
  meetingPoint: Localized;
  transportation: Localized;
  reservationInformation: Localized;
  entertainment: LocalizedList;
  includedServices: LocalizedList;
  excludedServices: LocalizedList;
  importantNotes: LocalizedList;
  coverImage: TripWithDerived['coverImage'];
  gallery: TripWithDerived['gallery'];
  startDate: string;
  endDate: string;
  reservationStartDate: string;
  reservationEndDate: string;
  price: string;
  currency: string;
  capacity: string;
  availableSeats: string;
  status: string;
  published: boolean;
  featured: boolean;
  displayOrder: string;
};

const EMPTY_LOCALIZED: Localized = { ar: '', en: '' };
const EMPTY_LIST: LocalizedList = { ar: [], en: [] };

function initialState(trip?: TripWithDerived): TripFormState {
  return {
    title: trip?.title ?? { ...EMPTY_LOCALIZED },
    slug: trip?.slug ?? '',
    shortDescription: trip?.shortDescription ?? { ...EMPTY_LOCALIZED },
    description: trip?.description ?? { ...EMPTY_LOCALIZED },
    destination: trip?.destination ?? { ...EMPTY_LOCALIZED },
    location: trip?.location ?? { ...EMPTY_LOCALIZED },
    meetingPoint: trip?.meetingPoint ?? { ...EMPTY_LOCALIZED },
    transportation: trip?.transportation ?? { ...EMPTY_LOCALIZED },
    reservationInformation: trip?.reservationInformation ?? { ...EMPTY_LOCALIZED },
    entertainment: trip?.entertainment ?? { ...EMPTY_LIST },
    includedServices: trip?.includedServices ?? { ...EMPTY_LIST },
    excludedServices: trip?.excludedServices ?? { ...EMPTY_LIST },
    importantNotes: trip?.importantNotes ?? { ...EMPTY_LIST },
    coverImage: trip?.coverImage ?? null,
    gallery: trip?.gallery ?? [],
    startDate: trip?.startDate.slice(0, 10) ?? '',
    endDate: trip?.endDate.slice(0, 10) ?? '',
    reservationStartDate: trip?.reservationStartDate?.slice(0, 10) ?? '',
    reservationEndDate: trip?.reservationEndDate?.slice(0, 10) ?? '',
    price: trip ? String(trip.price) : '',
    currency: trip?.currency ?? 'EGP',
    capacity: trip ? String(trip.capacity) : '',
    availableSeats: trip ? String(trip.availableSeats) : '',
    status: trip?.status ?? 'DRAFT',
    published: trip?.published ?? false,
    featured: trip?.featured ?? false,
    displayOrder: trip ? String(trip.displayOrder) : '0',
  };
}

/**
 * Create and edit share one form.
 *
 * The two differ only in where they POST and whether they start empty, so a second
 * component would be duplication. Errors returned by the server are keyed by field
 * path and rendered inline next to the control that caused them. CLAUDE.md §53.
 */
export function TripForm({ trip }: { trip?: TripWithDerived }) {
  const router = useRouter();
  const isEdit = Boolean(trip);

  const [state, setState] = useState<TripFormState>(() => initialState(trip));
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof TripFormState>(key: K, value: TripFormState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  /** Builds the JSON payload. Empty optional dates are sent as null, not "". */
  function toPayload() {
    return {
      title: state.title,
      slug: state.slug.trim() || undefined,
      shortDescription: state.shortDescription,
      description: state.description,
      destination: state.destination,
      location: state.location,
      meetingPoint: state.meetingPoint,
      transportation: state.transportation,
      reservationInformation: state.reservationInformation,
      entertainment: state.entertainment,
      includedServices: state.includedServices,
      excludedServices: state.excludedServices,
      importantNotes: state.importantNotes,
      coverImage: state.coverImage,
      gallery: state.gallery,
      startDate: state.startDate,
      endDate: state.endDate,
      reservationStartDate: state.reservationStartDate || null,
      reservationEndDate: state.reservationEndDate || null,
      price: state.price,
      currency: state.currency,
      capacity: state.capacity,
      availableSeats: state.availableSeats,
      status: state.status,
      published: state.published,
      featured: state.featured,
      displayOrder: state.displayOrder,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const payload = toPayload();

      const saved = isEdit
        ? await api.patch<TripWithDerived>(`/api/trips/${trip!.id}`, payload)
        : await api.post<TripWithDerived>('/api/trips', payload);

      if (isEdit) {
        setState(initialState(saved));
        setSuccess('Changes saved.');
        router.refresh();
      } else {
        router.push(`/admin/trips/${saved.id}/edit`);
        router.refresh();
        return;
      }
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setFormError(caught.message);
        if (caught.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(caught.details).map(([key, messages]) => [key, messages[0] ?? '']),
            ),
          );
        }
      } else {
        setFormError('Could not save the trip. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  const suggestedSlug = slugFromTitle(state.title);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8 pb-24">
      {formError ? <Alert tone="danger" title="The trip was not saved">{formError}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <FormSection title="Content" description="Both languages are shown to visitors; each field falls back to the other language when one is empty.">
        <BilingualField
          label="Title"
          required
          value={state.title}
          onChange={(value) => set('title', value)}
          error={fieldErrors.title}
          placeholder={{ ar: 'رحلة الإسكندرية', en: 'Alexandria Day Trip' }}
        />

        <Field
          label="URL slug"
          hint={
            state.slug
              ? `The trip will live at /ar/trips/${state.slug} and /en/trips/${state.slug}`
              : suggestedSlug
                ? `Leave blank to generate "${suggestedSlug}" from the title.`
                : 'Leave blank to generate one from the title.'
          }
          error={fieldErrors.slug}
        >
          {(props) => (
            <Input
              {...props}
              value={state.slug}
              onChange={(event) => set('slug', event.target.value)}
              placeholder={suggestedSlug || 'alexandria-day-trip'}
              dir="ltr"
            />
          )}
        </Field>

        <BilingualField
          label="Destination"
          required
          value={state.destination}
          onChange={(value) => set('destination', value)}
          error={fieldErrors.destination}
          placeholder={{ ar: 'الإسكندرية', en: 'Alexandria' }}
        />

        <BilingualField
          label="Location details"
          value={state.location}
          onChange={(value) => set('location', value)}
          hint="The specific sites visited, shown beside the destination."
          error={fieldErrors.location}
        />

        <BilingualField
          label="Short description"
          multiline
          rows={3}
          value={state.shortDescription}
          onChange={(value) => set('shortDescription', value)}
          hint="One or two sentences. Used on trip cards and in search results."
          error={fieldErrors.shortDescription}
        />

        <BilingualField
          label="Full description"
          multiline
          rows={8}
          value={state.description}
          onChange={(value) => set('description', value)}
          hint="Blank lines separate paragraphs."
          error={fieldErrors.description}
        />
      </FormSection>

      <FormSection title="Images">
        <ImageManager
          cover={state.coverImage}
          gallery={state.gallery}
          onCoverChange={(image) => set('coverImage', image)}
          onGalleryChange={(images) => set('gallery', images)}
          error={fieldErrors.coverImage}
        />
      </FormSection>

      <FormSection title="Schedule & pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Departure date" required error={fieldErrors.startDate}>
            {(props) => (
              <Input
                {...props}
                type="date"
                value={state.startDate}
                onChange={(event) => set('startDate', event.target.value)}
              />
            )}
          </Field>

          <Field label="Return date" required error={fieldErrors.endDate}>
            {(props) => (
              <Input
                {...props}
                type="date"
                value={state.endDate}
                onChange={(event) => set('endDate', event.target.value)}
              />
            )}
          </Field>

          <Field
            label="Reservations open"
            hint="Optional. Leave blank to accept reservations immediately."
            error={fieldErrors.reservationStartDate}
          >
            {(props) => (
              <Input
                {...props}
                type="date"
                value={state.reservationStartDate}
                onChange={(event) => set('reservationStartDate', event.target.value)}
              />
            )}
          </Field>

          <Field
            label="Reservations close"
            hint="Optional. Leave blank to keep them open until departure."
            error={fieldErrors.reservationEndDate}
          >
            {(props) => (
              <Input
                {...props}
                type="date"
                value={state.reservationEndDate}
                onChange={(event) => set('reservationEndDate', event.target.value)}
              />
            )}
          </Field>

          <Field label="Price" required error={fieldErrors.price}>
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={state.price}
                onChange={(event) => set('price', event.target.value)}
              />
            )}
          </Field>

          <Field label="Currency" error={fieldErrors.currency}>
            {(props) => (
              <Select
                {...props}
                value={state.currency}
                onChange={(event) => set('currency', event.target.value)}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Capacity" required hint="Total seats on this trip." error={fieldErrors.capacity}>
            {(props) => (
              <Input
                {...props}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={state.capacity}
                onChange={(event) => set('capacity', event.target.value)}
              />
            )}
          </Field>

          <Field
            label="Available seats"
            required
            hint="Seats still open. Cannot exceed the capacity."
            error={fieldErrors.availableSeats}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={state.availableSeats}
                onChange={(event) => set('availableSeats', event.target.value)}
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection title="What the trip includes">
        <BilingualListField
          label="Activities & entertainment"
          value={state.entertainment}
          onChange={(value) => set('entertainment', value)}
          placeholder={{ ar: 'جولة داخل القلعة', en: 'Tour inside the Citadel' }}
        />

        <BilingualListField
          label="Included in the price"
          value={state.includedServices}
          onChange={(value) => set('includedServices', value)}
        />

        <BilingualListField
          label="Not included"
          value={state.excludedServices}
          onChange={(value) => set('excludedServices', value)}
        />

        <BilingualListField
          label="Important notes"
          value={state.importantNotes}
          onChange={(value) => set('importantNotes', value)}
        />

        <BilingualField
          label="Transport"
          multiline
          rows={3}
          value={state.transportation}
          onChange={(value) => set('transportation', value)}
        />

        <BilingualField
          label="Meeting point"
          multiline
          rows={3}
          value={state.meetingPoint}
          onChange={(value) => set('meetingPoint', value)}
        />

        <BilingualField
          label="Reservation information"
          multiline
          rows={4}
          value={state.reservationInformation}
          onChange={(value) => set('reservationInformation', value)}
          hint="How to reserve, deposits, and any conditions."
        />
      </FormSection>

      <FormSection
        title="Visibility"
        description="Upcoming, ongoing and completed follow the trip's dates automatically. Choose Draft or Cancelled only to override that."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" error={fieldErrors.status}>
            {(props) => (
              <Select
                {...props}
                value={state.status}
                onChange={(event) => set('status', event.target.value)}
              >
                {TRIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Display order"
            hint="Lower numbers appear first among featured trips."
            error={fieldErrors.displayOrder}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={state.displayOrder}
                onChange={(event) => set('displayOrder', event.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            label="Published"
            description="Visible on the public site. Requires a cover image."
            checked={state.published}
            onChange={(event) => set('published', event.target.checked)}
          />

          <Checkbox
            label="Featured"
            description="Promoted on the homepage."
            checked={state.featured}
            onChange={(event) => set('featured', event.target.checked)}
          />
        </div>
      </FormSection>

      {/* A sticky bar so Save is always reachable on a long form. */}
      <div className="fixed inset-x-0 bottom-0 z-60 border-t border-sand bg-surface/95 backdrop-blur-sm lg:ps-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <p className="min-w-0 truncate text-caption text-ink-soft">
            {isEdit ? `Editing /${trip!.slug}` : 'New trip'}
          </p>

          <div className="flex shrink-0 gap-2">
            <Button as="a" href="/admin/trips" variant="ghost" size="sm">
              Cancel
            </Button>

            <Button type="submit" size="sm" disabled={pending}>
              <Icon name="check" size={16} />
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create trip'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-sand bg-surface p-5 shadow-hairline sm:p-6">
      <h2 className="text-h3 font-bold text-navy">{title}</h2>
      {description ? <p className="mt-1 text-caption text-ink-soft">{description}</p> : null}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
