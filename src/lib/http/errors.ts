/**
 * Domain errors.
 *
 * Services throw these; `withApiHandler` turns them into the standard error
 * envelope. Nothing below the HTTP layer should ever construct a `Response`.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TRIP_NOT_FOUND'
  | 'SETTINGS_NOT_FOUND'
  | 'SOCIAL_LINK_NOT_FOUND'
  | 'CONFLICT'
  | 'SLUG_TAKEN'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'BAD_REQUEST'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'STORAGE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

/** Field name → messages. Produced from Zod issues for `422` responses. */
export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: FieldErrors;

  constructor(code: ErrorCode, message: string, status: number, details?: FieldErrors) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The submitted data is invalid', details?: FieldErrors) {
    super('VALIDATION_ERROR', message, 422, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'The request could not be understood', code: ErrorCode = 'BAD_REQUEST') {
    super(code, message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required', code: ErrorCode = 'UNAUTHORIZED') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code: ErrorCode = 'NOT_FOUND') {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'The resource already exists', code: ErrorCode = 'CONFLICT') {
    super(code, message, 409);
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = 'Too many attempts. Please try again later.') {
    super('RATE_LIMITED', message, 429);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'The uploaded file is too large') {
    super('PAYLOAD_TOO_LARGE', message, 413);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = 'This file type is not supported') {
    super('UNSUPPORTED_MEDIA_TYPE', message, 415);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
