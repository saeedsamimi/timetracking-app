import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { AppException } from '../exceptions/app.exception';

const HTTP_TO_GRPC: Record<number, number> = {
  400: GrpcStatus.INVALID_ARGUMENT,
  401: GrpcStatus.UNAUTHENTICATED,
  403: GrpcStatus.PERMISSION_DENIED,
  404: GrpcStatus.NOT_FOUND,
  409: GrpcStatus.ALREADY_EXISTS,
  422: GrpcStatus.FAILED_PRECONDITION,
  500: GrpcStatus.INTERNAL,
};

@Catch()
export class GrpcExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionsFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    let httpStatus = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof AppException) {
      const res = {
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message || undefined,
        cause: (exception as { cause?: unknown }).cause,
      };
      httpStatus = res.statusCode;
      code = res.code;
      message = res.message ?? exception.message;
      this.logger.error(`${code}: ${message}`, exception.cause);
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      message = exception.message;
    } else {
      this.logger.error('Unhandled gRPC exception', exception as Error);
    }

    return throwError(() => ({
      code: HTTP_TO_GRPC[httpStatus] ?? GrpcStatus.UNKNOWN,
      message: JSON.stringify({ code, message }),
    }));
  }
}
