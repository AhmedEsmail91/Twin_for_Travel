'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PLATFORM_ICON } from '@/components/social/platform';
import { ApiClientError, api } from '@/lib/http/client';
import { cn } from '@/lib/utils/cn';
import { SOCIAL_PLATFORMS, type SocialLink, type SocialPlatform } from '@/modules/social/social.types';

/**
 * Social link management.
 *
 * These rows are the single source for every social URL on the site — the footer,
 * the contact page and the floating menu all read them. CLAUDE.md §22.
 */
export function SocialManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const router = useRouter();

  const [links, setLinks] = useState(initialLinks);
  const [platform, setPlatform] = useState<SocialPlatform>('whatsapp');
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<SocialLink | null>(null);

  const used = new Set(links.map((link) => link.platform));
  const available = SOCIAL_PLATFORMS.filter((entry) => !used.has(entry));

  function report(caught: unknown, fallback: string) {
    setError(caught instanceof ApiClientError ? caught.displayMessage : fallback);
  }

  async function create() {
    setCreating(true);
    setError(null);
    setNotice(null);

    try {
      const created = await api.post<SocialLink>('/api/social', {
        platform,
        url: url.trim(),
        label: label.trim(),
        enabled: true,
        displayOrder: links.length + 1,
      });

      setLinks((current) => [...current, created]);
      setUrl('');
      setLabel('');
      setNotice(`${created.platform} link added.`);
      router.refresh();
    } catch (caught) {
      report(caught, 'Could not add the link.');
    } finally {
      setCreating(false);
    }
  }

  async function update(link: SocialLink, changes: Partial<SocialLink>) {
    setPendingId(link.id);
    setError(null);
    setNotice(null);

    try {
      const updated = await api.patch<SocialLink>(`/api/social/${link.id}`, changes);
      setLinks((current) => current.map((entry) => (entry.id === link.id ? updated : entry)));
      router.refresh();
    } catch (caught) {
      report(caught, 'Could not update the link.');
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setPendingId(toDelete.id);

    try {
      await api.delete(`/api/social/${toDelete.id}`);
      setLinks((current) => current.filter((entry) => entry.id !== toDelete.id));
      setNotice(`${toDelete.platform} link removed.`);
      setToDelete(null);
      router.refresh();
    } catch (caught) {
      report(caught, 'Could not remove the link.');
    } finally {
      setPendingId(null);
    }
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= links.length) return;

    const a = links[index];
    const b = links[target];
    if (!a || !b) return;

    // Swap the two rows' order values; the list re-sorts on the server's response.
    setLinks((current) => {
      const next = [...current];
      next[index] = b;
      next[target] = a;
      return next;
    });

    void update(a, { displayOrder: b.displayOrder });
    void update(b, { displayOrder: a.displayOrder });
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <section className="rounded-lg border border-sand bg-surface p-5 shadow-hairline">
        <h2 className="text-h3 font-bold text-navy">Add a link</h2>

        {available.length === 0 ? (
          <p className="mt-3 text-body-sm text-ink-soft">
            Every supported platform already has a link. Edit or remove one below to change it.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Platform">
              {(props) => (
                <Select
                  {...props}
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as SocialPlatform)}
                >
                  {available.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="URL" hint="Must start with https://">
              {(props) => (
                <Input
                  {...props}
                  value={url}
                  dir="ltr"
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              )}
            </Field>

            <Field label="Display name" hint="Optional. Defaults to the platform name.">
              {(props) => (
                <Input
                  {...props}
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Our Instagram"
                />
              )}
            </Field>

            <div className="sm:col-span-3">
              <Button onClick={create} disabled={creating || url.trim().length === 0}>
                <Icon name="plus" size={16} />
                {creating ? 'Adding…' : 'Add link'}
              </Button>
            </div>
          </div>
        )}
      </section>

      {links.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title="No social links yet"
          body="Add a link above and it appears in the footer, on the contact page and in the floating menu."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {links.map((link, index) => {
            const busy = pendingId === link.id;

            return (
              <li
                key={link.id}
                className={cn(
                  'rounded-lg border border-sand bg-surface p-4 shadow-hairline transition-opacity',
                  busy && 'opacity-60',
                )}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-dark">
                    <Icon name={PLATFORM_ICON[link.platform]} size={20} />
                  </span>

                  <div className="min-w-0 flex-1 space-y-3">
                    <p className="text-body-sm font-bold text-navy capitalize">{link.platform}</p>

                    <Input
                      dir="ltr"
                      value={link.url}
                      aria-label={`${link.platform} URL`}
                      onChange={(event) =>
                        setLinks((current) =>
                          current.map((entry) =>
                            entry.id === link.id ? { ...entry, url: event.target.value } : entry,
                          ),
                        )
                      }
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value !== initialLinks.find((l) => l.id === link.id)?.url) {
                          void update(link, { url: value });
                        }
                      }}
                    />

                    <Input
                      value={link.label}
                      aria-label={`${link.platform} display name`}
                      placeholder="Display name (optional)"
                      onChange={(event) =>
                        setLinks((current) =>
                          current.map((entry) =>
                            entry.id === link.id ? { ...entry, label: event.target.value } : entry,
                          ),
                        )
                      }
                      onBlur={(event) => void update(link, { label: event.target.value.trim() })}
                    />
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void update(link, { enabled: !link.enabled })}
                      disabled={busy}
                      aria-pressed={link.enabled}
                      className={cn(
                        'rounded-sm border px-2.5 py-1.5 text-caption font-semibold transition-colors duration-150 disabled:opacity-50',
                        link.enabled
                          ? 'border-success/40 bg-success/12 text-success'
                          : 'border-sand bg-surface-sunk text-ink-soft',
                      )}
                    >
                      {link.enabled ? 'Visible' : 'Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${link.platform} earlier`}
                      className="rounded-md p-2 text-ink-soft hover:bg-surface-sunk hover:text-navy disabled:opacity-30"
                    >
                      <Icon name="chevronDown" size={16} className="rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === links.length - 1}
                      aria-label={`Move ${link.platform} later`}
                      className="rounded-md p-2 text-ink-soft hover:bg-surface-sunk hover:text-navy disabled:opacity-30"
                    >
                      <Icon name="chevronDown" size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setToDelete(link)}
                      disabled={busy}
                      aria-label={`Remove ${link.platform}`}
                      className="rounded-md p-2 text-ink-soft hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        pending={pendingId === toDelete?.id}
        title="Remove this link?"
        description={
          toDelete
            ? `The ${toDelete.platform} link will be removed from the footer, the contact page and the floating menu.`
            : ''
        }
        confirmLabel="Remove"
      />
    </div>
  );
}
