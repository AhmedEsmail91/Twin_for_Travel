'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { BilingualField } from './BilingualField';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ApiClientError, api } from '@/lib/http/client';
import type { SiteSettings } from '@/modules/settings/settings.types';

/**
 * Site settings.
 *
 * Everything here is read by the public site at render time, so a save is visible
 * immediately — no rebuild, no cache to bust. The WhatsApp number in particular is
 * the single source for the floating button and every reservation CTA.
 */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();

  const [state, setState] = useState(settings);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const saved = await api.put<SiteSettings>('/api/settings', {
        companyName: state.companyName,
        tagline: state.tagline,
        about: state.about,
        whatsappNumber: state.whatsappNumber,
        whatsappMessage: state.whatsappMessage,
        contactPhone: state.contactPhone,
        contactEmail: state.contactEmail,
        address: state.address,
        workingHours: state.workingHours,
        mapUrl: state.mapUrl,
        seoTitle: state.seoTitle,
        seoDescription: state.seoDescription,
      });

      setState(saved);
      setSuccess('Settings saved. They are live on the site now.');
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setError(caught.message);
        if (caught.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(caught.details).map(([key, messages]) => [key, messages[0] ?? '']),
            ),
          );
        }
      } else {
        setError('Could not save the settings. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-24">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <Section title="Company">
        <BilingualField
          label="Company name"
          value={state.companyName}
          onChange={(value) => set('companyName', value)}
          error={fieldErrors.companyName}
        />

        <BilingualField
          label="Tagline"
          value={state.tagline}
          onChange={(value) => set('tagline', value)}
          hint="Shown under the logo in the header and above the hero headline."
          error={fieldErrors.tagline}
        />

        <BilingualField
          label="About the company"
          multiline
          rows={6}
          value={state.about}
          onChange={(value) => set('about', value)}
          hint="Used in the footer and as the story on the About page."
          error={fieldErrors.about}
        />
      </Section>

      <Section
        title="WhatsApp"
        description="The number behind the floating button and every reservation call to action."
      >
        <Field
          label="WhatsApp number"
          hint="Include the country code, e.g. +20 101 275 2911. Leave blank to hide the button entirely."
          error={fieldErrors.whatsappNumber}
        >
          {(props) => (
            <Input
              {...props}
              dir="ltr"
              value={state.whatsappNumber}
              onChange={(event) => set('whatsappNumber', event.target.value)}
              placeholder="+20 101 275 2911"
              inputMode="tel"
            />
          )}
        </Field>

        <BilingualField
          label="Pre-filled message"
          multiline
          rows={2}
          value={state.whatsappMessage}
          onChange={(value) => set('whatsappMessage', value)}
          hint="What the visitor's chat opens with. Trip pages append the trip name automatically."
          error={fieldErrors.whatsappMessage}
        />
      </Section>

      <Section title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={fieldErrors.contactPhone}>
            {(props) => (
              <Input
                {...props}
                dir="ltr"
                value={state.contactPhone}
                onChange={(event) => set('contactPhone', event.target.value)}
                inputMode="tel"
              />
            )}
          </Field>

          <Field label="Email" error={fieldErrors.contactEmail}>
            {(props) => (
              <Input
                {...props}
                dir="ltr"
                type="email"
                value={state.contactEmail}
                onChange={(event) => set('contactEmail', event.target.value)}
              />
            )}
          </Field>
        </div>

        <BilingualField
          label="Address"
          value={state.address}
          onChange={(value) => set('address', value)}
          error={fieldErrors.address}
        />

        <BilingualField
          label="Opening hours"
          value={state.workingHours}
          onChange={(value) => set('workingHours', value)}
          error={fieldErrors.workingHours}
        />

        <Field
          label="Map link"
          hint="Optional. A Google Maps URL; the address links to it on the contact page."
          error={fieldErrors.mapUrl}
        >
          {(props) => (
            <Input
              {...props}
              dir="ltr"
              value={state.mapUrl}
              onChange={(event) => set('mapUrl', event.target.value)}
              placeholder="https://maps.google.com/…"
            />
          )}
        </Field>
      </Section>

      <Section
        title="Search engine listing"
        description="Optional overrides for the homepage title and description. Leave blank to use the built-in copy."
      >
        <BilingualField
          label="Meta title"
          value={state.seoTitle}
          onChange={(value) => set('seoTitle', value)}
          error={fieldErrors.seoTitle}
        />

        <BilingualField
          label="Meta description"
          multiline
          rows={3}
          value={state.seoDescription}
          onChange={(value) => set('seoDescription', value)}
          error={fieldErrors.seoDescription}
        />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-60 border-t border-sand bg-surface/95 backdrop-blur-sm lg:ps-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-5 py-3 sm:px-8">
          <Button type="submit" size="sm" disabled={pending}>
            <Icon name="check" size={16} />
            {pending ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
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
