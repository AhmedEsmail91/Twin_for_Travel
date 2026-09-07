import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AppError, RateLimitError, type FieldErrors } from './errors';
import { failure } from './response';
import { assertSameOrigin } from '@/lib/security/origin';
import { isProduction } from '@/config/env';

type RouteContext<TParams> = { params: Promise<TParams> };

type Handler<TParams> = (
  request: Request,
  context: RouteContext<TParams>,
) => Promise<NextResponse> | NextResponse;

/**
 * The single place route handlers get their error handling and CSRF check.
 *
 * Handlers stay thin: no try/catch, no `NextResponse.json({ success: false })`.
 * They authenticate, parse, delegate to a controller, and return. Anything thrown
 * below is normalised here. See CLAUDE.md §7.
 */
export function withApiHandler<TParams = Record<string, string>>(
  handler: Handler<TParams>,
): (request: Request, context: RouteContext<TParams>) => Promise<NextResponse> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error, request);
    }
  };
}

export function toErrorResponse(error: unknown, request?: Request): NextResponse {
  if (error instanceof ZodError) {
    return failure('VALIDATION_ERROR', 'The submitted data is invalid', 422, zodToFieldErrors(error));
  }

  if (error instanceof RateLimitError) {
    return failure(error.code, error.message, error.status, error.details, {
      headers: { 'Retry-After': String(error.retryAfterSeconds) },
    });
  }

  if (error instanceof AppError) {
    return failure(error.code, error.message, error.status, error.details);
  }

  // Anything else is a bug. Log it with context; return nothing that leaks internals.
  console.error('[api] unhandled error', {
    method: request?.method,
    url: request?.url,
    error: isProduction && error instanceof Error ? error.message : error,
  });

  return failure('INTERNAL_ERROR', 'An unexpected error occurred. Please try again.', 500);
}

export function zodToFieldErrors(error: ZodError): FieldErrors {
  const details: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_';
    (details[path] ??= []).push(issue.message);
  }

  return details;
}
