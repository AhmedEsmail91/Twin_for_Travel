'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ApiClientError, api } from '@/lib/http/client';
import { cn } from '@/lib/utils/cn';
import type { StoredFile } from '@/lib/storage/types';
import type { TripImage } from '@/modules/trips/trip.types';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

function toTripImage(file: StoredFile): TripImage {
  return {
    url: file.url,
    storageKey: file.key,
    alt: { ar: '', en: '' },
    width: file.width,
    height: file.height,
  };
}

/**
 * Cover image and gallery management.
 *
 * Uploads go straight to `/api/uploads`, which validates the bytes before they
 * reach a storage provider. Removing an image from a trip does *not* delete the
 * stored file: the same upload may be referenced elsewhere, and an accidental
 * removal that is then not saved would otherwise destroy the original. Files are
 * deleted explicitly, from the gallery's own delete control.
 */
export function ImageManager({
  cover,
  gallery,
  onCoverChange,
  onGalleryChange,
  error,
}: {
  cover: TripImage | null;
  gallery: TripImage[];
  onCoverChange: (image: TripImage | null) => void;
  onGalleryChange: (images: TripImage[]) => void;
  error?: string;
}) {
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null, target: 'cover' | 'gallery') {
    if (!files || files.length === 0) return;

    setUploading(target);
    setUploadError(null);

    try {
      const uploaded: TripImage[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        uploaded.push(toTripImage(await api.upload<StoredFile>('/api/uploads', formData)));
      }

      if (target === 'cover') {
        if (uploaded[0]) onCoverChange(uploaded[0]);
      } else {
        onGalleryChange([...gallery, ...uploaded]);
      }
    } catch (caught) {
      setUploadError(
        caught instanceof ApiClientError ? caught.message : 'The upload failed. Please try again.',
      );
    } finally {
      setUploading(null);
      if (coverInput.current) coverInput.current.value = '';
      if (galleryInput.current) galleryInput.current.value = '';
    }
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= gallery.length) return;

    const next = [...gallery];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    onGalleryChange(next);
  }

  function updateAlt(index: number, locale: 'ar' | 'en', value: string) {
    onGalleryChange(
      gallery.map((image, position) =>
        position === index ? { ...image, alt: { ...image.alt, [locale]: value } } : image,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {uploadError ? <Alert tone="danger">{uploadError}</Alert> : null}

      <section>
        <h3 className="mb-1 text-body-sm font-semibold text-navy">
          Cover image <span className="text-danger">*</span>
        </h3>
        <p className="mb-3 text-caption text-ink-soft">
          Shown on trip cards and at the top of the trip page. Required before the trip can be
          published. JPG, PNG, WebP or AVIF, up to 8&nbsp;MB.
        </p>

        {cover ? (
          <div className="flex flex-col gap-3 rounded-lg border border-sand bg-surface p-3 sm:flex-row">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-surface-sunk sm:w-56">
              <Image src={cover.url} alt="" fill sizes="224px" className="object-cover" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="u-numeric text-caption text-ink-soft">
                {cover.width}×{cover.height}
              </p>

              <label className="text-caption font-semibold text-navy">
                Alt text (English)
                <Input
                  value={cover.alt.en}
                  onChange={(event) =>
                    onCoverChange({ ...cover, alt: { ...cover.alt, en: event.target.value } })
                  }
                  placeholder="What the photo shows"
                  className="mt-1"
                />
              </label>

              <label className="text-caption font-semibold text-navy">
                Alt text (Arabic)
                <Input
                  dir="rtl"
                  value={cover.alt.ar}
                  onChange={(event) =>
                    onCoverChange({ ...cover, alt: { ...cover.alt, ar: event.target.value } })
                  }
                  placeholder="وصف الصورة"
                  className="mt-1"
                />
              </label>

              <button
                type="button"
                onClick={() => onCoverChange(null)}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold text-danger hover:bg-danger/10"
              >
                <Icon name="trash" size={15} />
                Remove cover
              </button>
            </div>
          </div>
        ) : (
          <UploadTile
            label={uploading === 'cover' ? 'Uploading…' : 'Upload a cover image'}
            busy={uploading === 'cover'}
            invalid={Boolean(error)}
            onClick={() => coverInput.current?.click()}
          />
        )}

        <input
          ref={coverInput}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => upload(event.target.files, 'cover')}
        />

        {error ? <p className="mt-2 text-caption font-medium text-danger">{error}</p> : null}
      </section>

      <section>
        <h3 className="mb-1 text-body-sm font-semibold text-navy">Gallery</h3>
        <p className="mb-3 text-caption text-ink-soft">
          Photographs shown on the trip page and in the homepage strip. Drag order is set with the
          arrows; the first image appears first.
        </p>

        {gallery.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-3">
            {gallery.map((image, index) => (
              <li
                key={`${image.storageKey}-${index}`}
                className="flex flex-col gap-3 rounded-lg border border-sand bg-surface p-3 sm:flex-row"
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-surface-sunk sm:w-40">
                  <Image src={image.url} alt="" fill sizes="160px" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="u-numeric text-caption text-ink-soft">
                      #{index + 1} · {image.width}×{image.height}
                    </span>

                    <div className="flex items-center gap-1">
                      <IconButton
                        label={`Move image ${index + 1} earlier`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        rotate
                      />
                      <IconButton
                        label={`Move image ${index + 1} later`}
                        disabled={index === gallery.length - 1}
                        onClick={() => move(index, 1)}
                      />
                      <button
                        type="button"
                        onClick={() => onGalleryChange(gallery.filter((_, i) => i !== index))}
                        aria-label={`Remove image ${index + 1}`}
                        className="rounded-md p-1.5 text-ink-soft hover:bg-danger/10 hover:text-danger"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>

                  <Input
                    value={image.alt.en}
                    onChange={(event) => updateAlt(index, 'en', event.target.value)}
                    placeholder="Alt text (English)"
                  />
                  <Input
                    dir="rtl"
                    value={image.alt.ar}
                    onChange={(event) => updateAlt(index, 'ar', event.target.value)}
                    placeholder="النص البديل (بالعربية)"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <UploadTile
          label={uploading === 'gallery' ? 'Uploading…' : 'Add gallery images'}
          busy={uploading === 'gallery'}
          compact={gallery.length > 0}
          onClick={() => galleryInput.current?.click()}
        />

        <input
          ref={galleryInput}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(event) => upload(event.target.files, 'gallery')}
        />
      </section>
    </div>
  );
}

function UploadTile({
  label,
  busy,
  onClick,
  compact = false,
  invalid = false,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
  compact?: boolean;
  invalid?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-surface-sunk text-ink-soft transition-colors duration-150 hover:border-gold hover:text-navy disabled:opacity-60',
        compact ? 'py-6' : 'py-12',
        invalid ? 'border-danger' : 'border-sand',
      )}
    >
      <Icon name={busy ? 'clock' : 'plus'} size={22} />
      <span className="text-body-sm font-semibold">{label}</span>
    </button>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  rotate = false,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  rotate?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-surface-sunk hover:text-navy disabled:opacity-30"
    >
      <Icon name="chevronDown" size={16} className={rotate ? 'rotate-180' : undefined} />
    </button>
  );
}
