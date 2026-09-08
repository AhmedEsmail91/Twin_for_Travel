'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from './Button';
import { Icon } from './Icon';

/**
 * Built on the native `<dialog>` element.
 *
 * The platform already provides the focus trap, the `Escape` handler, the top-layer
 * stacking and the `aria-modal` semantics that a hand-rolled modal has to
 * reimplement — and usually gets wrong. CLAUDE.md §37.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = 'Close dialog',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-sand bg-surface p-0 text-ink shadow-lifted backdrop:bg-navy-dark/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-sand px-5 py-4">
        <div className="min-w-0">
          <h2 id="modal-title" className="text-h3 font-display text-navy">
            {title}
          </h2>
          {description ? (
            <p id="modal-description" className="mt-1 text-body-sm text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="-me-1 rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-surface-sunk hover:text-navy"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {children ? <div className="px-5 py-4">{children}</div> : null}

      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-sand bg-surface-sunk px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}

/** The delete-confirmation dialog used across the admin. CLAUDE.md §41. */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  deletingLabel = 'Deleting…',
  closeLabel,
  pending = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  deletingLabel?: string;
  closeLabel?: string;
  pending?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      closeLabel={closeLabel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? deletingLabel : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
