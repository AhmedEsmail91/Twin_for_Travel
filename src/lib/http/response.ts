import { NextResponse } from 'next/server';

import type { ErrorCode, FieldErrors } from './errors';

/**
 * The single response shape used by every route handler. See CLAUDE.md §7.
 */
export type ApiSuccess<T> = { success: true; data: T };

export type ApiFailure = {
  success: false;
  error: { code: ErrorCode; message: string; details?: FieldErrors };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 201, ...init });
}

export function failure(
  code: ErrorCode,
  message: string,
  status: number,
  details?: FieldErrors,
  init?: ResponseInit,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: details ? { code, message, details } : { code, message } },
    { status, ...init },
  );
}
