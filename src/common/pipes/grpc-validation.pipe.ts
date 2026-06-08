import { status } from '@grpc/grpc-js';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class GrpcValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.flatMap((err) =>
          Object.values(err.constraints ?? {}),
        );
        return new RpcException({
          code: status.INVALID_ARGUMENT,
          message: messages.join('; '),
        });
      },
    });
  }
}
