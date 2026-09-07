'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { ApiClientError, api } from '@/lib/http/client';
import { loginSchema } from '@/modules/auth/auth.schema';

/**
 * Client validation mirrors the server's Zod schema for immediate feedback. The
 * server validates again regardless — client validation is UX, never a control.
 * CLAUDE.md §53.
 */
export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const candidate = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    };

    const parsed = loginSchema.safeParse(candidate);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setPending(true);

    try {
      await api.post('/api/auth/login', parsed.data);
      // A full navigation so the server re-reads the new session cookie.
      router.replace(safeRedirect(nextPath));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(error.details).map(([key, messages]) => [key, messages[0] ?? '']),
            ),
          );
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <h2 className="text-h3 text-navy">Sign in</h2>

      {formError ? <Alert tone="danger">{formError}</Alert> : null}

      <Field label="Email" required error={fieldErrors.email}>
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Password" required error={fieldErrors.password}>
        {(props) => (
          <Input {...props} name="password" type="password" autoComplete="current-password" />
        )}
      </Field>

      <Button type="submit" disabled={pending} fullWidth className="mt-2">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

/**
 * Only same-site absolute paths are honoured, so a crafted `?next=//evil.example`
 * cannot turn the login page into an open redirect.
 */
function safeRedirect(path: string | undefined): string {
  if (!path) return '/admin';
  if (!path.startsWith('/admin')) return '/admin';
  if (path.startsWith('//')) return '/admin';
  return path;
}
