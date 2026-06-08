import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 409, description: 'HTTP status code.' })
  statusCode: number;

  @ApiProperty({
    example: 'TIMER_ALREADY_RUNNING',
    description: 'Stable, machine-readable error code.',
  })
  code: string;

  @ApiProperty({
    required: false,
    example: 'A timer is already running for this user.',
    description: 'Optional human-readable message.',
  })
  message?: string;

  // NOTE: `cause` is intentionally omitted — it is never serialized.
}
