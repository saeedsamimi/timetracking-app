import { HttpStatus } from '@nestjs/common';

export interface AppExceptionOptions extends ErrorOptions {
  /** HTTP status code returned to the client. */
  statusCode: HttpStatus | number;
  /** Stable, machine-readable error code (e.g. TIMER_ALREADY_RUNNING). */
  code: string;
  /** Optional human-readable message. */
  message?: string;
}

/**
 * Base class for all application exceptions.
 *
 * Carries a standardized payload (statusCode, code, message) plus an
 * optional `cause` (via the native ErrorOptions). The `cause` is preserved
 * for logging/debugging but is intentionally NOT serialized in responses.
 */
export class AppException extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(options: AppExceptionOptions) {
    // Passing { cause } to super stores it on `this.cause` (Error.cause).
    super(options.message, { cause: options.cause });
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.name = this.constructor.name;
  }
}
