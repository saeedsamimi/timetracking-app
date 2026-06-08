import { AppException } from '@/common/exceptions/app.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface NormalizedError {
  statusCode: number;
  code: string;
  message?: string;
  cause?: unknown; // for logging only — stripped before sending
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const normalized = this.normalize(exception);

    // Log full context including cause; never sent to the client.
    if (normalized.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${normalized.code}] ${normalized.message ?? ''}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`[${normalized.code}] ${normalized.message ?? ''}`);
    }
    if (normalized.cause !== undefined) {
      this.logger.debug({ cause: normalized.cause });
    }

    // Build the response body — `cause` is explicitly excluded.
    const body: Record<string, unknown> = {
      statusCode: normalized.statusCode,
      code: normalized.code,
    };
    if (normalized.message !== undefined) {
      body.message = normalized.message;
    }

    response.status(normalized.statusCode).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    // 1. Our own application exceptions.
    if (exception instanceof AppException) {
      return {
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message || undefined,
        cause: (exception as { cause?: unknown }).cause,
      };
    }

    // 2. Built-in Nest HttpExceptions (e.g. ValidationPipe, ParseUUIDPipe).
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ??
            exception.message);

      return {
        statusCode: status,
        code: this.codeFromStatus(status),
        message: Array.isArray(message) ? message.join(', ') : message,
        cause: (exception as { cause?: unknown }).cause,
      };
    }

    // 3. Anything else — treat as an unexpected internal error.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      cause: exception,
    };
  }

  /** Derive a default error code from an HTTP status for built-in errors. */
  private codeFromStatus(status: number): string {
    const name = HttpStatus[status];
    return typeof name === 'string' ? name : `HTTP_${status}`;
  }
}
