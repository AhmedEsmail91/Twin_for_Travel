'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.settings');

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
      setSuccess(t('savedNotice'));
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
        setError(t('genericError'));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-24">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <Section title={t('sections.company.title')}>
        <BilingualField
          label={t('fields.companyName')}
          value={state.companyName}
          onChange={(value) => set('companyName', value)}
          error={fieldErrors.companyName}
        />

        <BilingualField
          label={t('fields.tagline')}
          value={state.tagline}
          onChange={(value) => set('tagline', value)}
          hint={t('fields.taglineHint')}
          error={fieldErrors.tagline}
        />

        <BilingualField
          label={t('fields.about')}
          multiline
          rows={6}
          value={state.about}
          onChange={(value) => set('about', value)}
          hint={t('fields.aboutHint')}
          error={fieldErrors.about}
        />
      </Section>

      <Section title={t('sections.whatsapp.title')} description={t('sections.whatsapp.description')}>
        <Field
          label={t('fields.whatsappNumber')}
          hint={t('fields.whatsappNumberHint')}
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
          label={t('fields.whatsappMessage')}
          multiline
          rows={2}
          value={state.whatsappMessage}
          onChange={(value) => set('whatsappMessage', value)}
          hint={t('fields.whatsappMessageHint')}
          error={fieldErrors.whatsappMessage}
        />
      </Section>

      <Section title={t('sections.contact.title')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.phone')} error={fieldErrors.contactPhone}>
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

          <Field label={t('fields.email')} error={fieldErrors.contactEmail}>
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
          label={t('fields.address')}
          value={state.address}
          onChange={(value) => set('address', value)}
          error={fieldErrors.address}
        />

        <BilingualField
          label={t('fields.workingHours')}
          value={state.workingHours}
          onChange={(value) => set('workingHours', value)}
          error={fieldErrors.workingHours}
        />

        <Field label={t('fields.mapUrl')} hint={t('fields.mapUrlHint')} error={fieldErrors.mapUrl}>
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

      <Section title={t('sections.seo.title')} description={t('sections.seo.description')}>
        <BilingualField
          label={t('fields.seoTitle')}
          value={state.seoTitle}
          onChange={(value) => set('seoTitle', value)}
          error={fieldErrors.seoTitle}
        />

        <BilingualField
          label={t('fields.seoDescription')}
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
            {pending ? t('saving') : t('save')}
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
