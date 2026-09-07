/**
 * Browser-side API client.
 *
 * Every admin mutation goes through here, so the response envelope is unwrapped in
 * one place and a failure always surfaces as a typed `ApiClientError` carrying the
 * server's field errors — which the forms render inline.
 */

import type { ErrorCode, FieldErrors } from './errors';

export class ApiClientError extends Error {
  readonly code: ErrorCode | 'NETWORK_ERROR';
  readonly status: number;
  readonly details?: FieldErrors;

  constructor(
    message: string,
    code: ErrorCode | 'NETWORK_ERROR',
    status: number,
    details?: FieldErrors,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * A message worth showing where there is no field to attach an inline error to —
   * a toggle in a table, say. Falls back to the first field error when the
   * top-level message is the generic validation one.
   */
  get displayMessage(): string {
    const generic = this.message === 'The submitted data is invalid';
    if (!generic || !this.details) return this.message;

    const first = Object.values(this.details).flat()[0];
    return first ?? this.message;
  }
}

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string; details?: FieldErrors } };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      // Sends the session cookie; the server's same-origin check covers CSRF.
      credentials: 'same-origin',
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      'Could not reach the server. Check your connection and try again.',
      'NETWORK_ERROR',
      0,
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!payload) {
    throw new ApiClientError('The server returned an unreadable response.', 'INTERNAL_ERROR', response.status);
  }

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.message,
      payload.error.code,
      response.status,
      payload.error.details,
    );
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
};
