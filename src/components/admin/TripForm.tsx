'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.tripForm');
  const tStatus = useTranslations('admin.trips.status');
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
        setSuccess(t('savedNotice'));
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
        setFormError(t('genericError'));
      }
    } finally {
      setPending(false);
    }
  }

  const suggestedSlug = slugFromTitle(state.title);

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-8 pb-24">
      {formError ? (
        <Alert tone="danger" title={t('errorTitle')}>
          {formError}
        </Alert>
      ) : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <FormSection title={t('sections.content.title')} description={t('sections.content.description')}>
        <BilingualField
          label={t('fields.title')}
          required
          value={state.title}
          onChange={(value) => set('title', value)}
          error={fieldErrors.title}
          placeholder={{ ar: t('fields.titlePlaceholderAr'), en: t('fields.titlePlaceholderEn') }}
        />

        <Field
          label={t('fields.slug')}
          hint={
            state.slug
              ? t('fields.slugHintWithValue', { slug: state.slug })
              : suggestedSlug
                ? t('fields.slugHintSuggested', { slug: suggestedSlug })
                : t('fields.slugHintEmpty')
          }
          error={fieldErrors.slug}
        >
          {(props) => (
            <Input
              {...props}
              value={state.slug}
              onChange={(event) => set('slug', event.target.value)}
              placeholder={suggestedSlug || t('fields.slugPlaceholder')}
              dir="ltr"
            />
          )}
        </Field>

        <BilingualField
          label={t('fields.destination')}
          required
          value={state.destination}
          onChange={(value) => set('destination', value)}
          error={fieldErrors.destination}
          placeholder={{
            ar: t('fields.destinationPlaceholderAr'),
            en: t('fields.destinationPlaceholderEn'),
          }}
        />

        <BilingualField
          label={t('fields.location')}
          value={state.location}
          onChange={(value) => set('location', value)}
          hint={t('fields.locationHint')}
          error={fieldErrors.location}
        />

        <BilingualField
          label={t('fields.shortDescription')}
          multiline
          rows={3}
          value={state.shortDescription}
          onChange={(value) => set('shortDescription', value)}
          hint={t('fields.shortDescriptionHint')}
          error={fieldErrors.shortDescription}
        />

        <BilingualField
          label={t('fields.fullDescription')}
          multiline
          rows={8}
          value={state.description}
          onChange={(value) => set('description', value)}
          hint={t('fields.fullDescriptionHint')}
          error={fieldErrors.description}
        />
      </FormSection>

      <FormSection title={t('sections.images.title')}>
        <ImageManager
          cover={state.coverImage}
          gallery={state.gallery}
          onCoverChange={(image) => set('coverImage', image)}
          onGalleryChange={(images) => set('gallery', images)}
          error={fieldErrors.coverImage}
        />
      </FormSection>

      <FormSection title={t('sections.schedule.title')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.departureDate')} required error={fieldErrors.startDate}>
            {(props) => (
              <Input
                {...props}
                type="date"
                value={state.startDate}
                onChange={(event) => set('startDate', event.target.value)}
              />
            )}
          </Field>

          <Field label={t('fields.returnDate')} required error={fieldErrors.endDate}>
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
            label={t('fields.reservationsOpen')}
            hint={t('fields.reservationsOpenHint')}
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
            label={t('fields.reservationsClose')}
            hint={t('fields.reservationsCloseHint')}
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

          <Field label={t('fields.price')} required error={fieldErrors.price}>
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

          <Field label={t('fields.currency')} error={fieldErrors.currency}>
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

          <Field
            label={t('fields.capacity')}
            required
            hint={t('fields.capacityHint')}
            error={fieldErrors.capacity}
          >
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
            label={t('fields.availableSeats')}
            required
            hint={t('fields.availableSeatsHint')}
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

      <FormSection title={t('sections.includes.title')}>
        <BilingualListField
          label={t('fields.activities')}
          value={state.entertainment}
          onChange={(value) => set('entertainment', value)}
          placeholder={{
            ar: t('fields.activitiesPlaceholderAr'),
            en: t('fields.activitiesPlaceholderEn'),
          }}
        />

        <BilingualListField
          label={t('fields.included')}
          value={state.includedServices}
          onChange={(value) => set('includedServices', value)}
        />

        <BilingualListField
          label={t('fields.excluded')}
          value={state.excludedServices}
          onChange={(value) => set('excludedServices', value)}
        />

        <BilingualListField
          label={t('fields.notes')}
          value={state.importantNotes}
          onChange={(value) => set('importantNotes', value)}
        />

        <BilingualField
          label={t('fields.transport')}
          multiline
          rows={3}
          value={state.transportation}
          onChange={(value) => set('transportation', value)}
        />

        <BilingualField
          label={t('fields.meetingPoint')}
          multiline
          rows={3}
          value={state.meetingPoint}
          onChange={(value) => set('meetingPoint', value)}
        />

        <BilingualField
          label={t('fields.reservationInfo')}
          multiline
          rows={4}
          value={state.reservationInformation}
          onChange={(value) => set('reservationInformation', value)}
          hint={t('fields.reservationInfoHint')}
        />
      </FormSection>

      <FormSection
        title={t('sections.visibility.title')}
        description={t('sections.visibility.description')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.status')} error={fieldErrors.status}>
            {(props) => (
              <Select
                {...props}
                value={state.status}
                onChange={(event) => set('status', event.target.value)}
              >
                {TRIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {tStatus(status)}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label={t('fields.displayOrder')}
            hint={t('fields.displayOrderHint')}
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
            label={t('fields.published')}
            description={t('fields.publishedHint')}
            checked={state.published}
            onChange={(event) => set('published', event.target.checked)}
          />

          <Checkbox
            label={t('fields.featured')}
            description={t('fields.featuredHint')}
            checked={state.featured}
            onChange={(event) => set('featured', event.target.checked)}
          />
        </div>
      </FormSection>

      {/* A sticky bar so Save is always reachable on a long form. */}
      <div className="fixed inset-x-0 bottom-0 z-60 border-t border-sand bg-surface/95 backdrop-blur-sm lg:ps-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <p className="min-w-0 truncate text-caption text-ink-soft">
            {isEdit ? t('editingLabel', { slug: trip!.slug }) : t('newTripLabel')}
          </p>

          <div className="flex shrink-0 gap-2">
            <Button as="a" href="/admin/trips" variant="ghost" size="sm">
              {t('cancel')}
            </Button>

            <Button type="submit" size="sm" disabled={pending}>
              <Icon name="check" size={16} />
              {pending ? t('saving') : isEdit ? t('saveChanges') : t('createTrip')}
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
