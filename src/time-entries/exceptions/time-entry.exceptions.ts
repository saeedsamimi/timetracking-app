import { AppException } from '@/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';

export class TimerAlreadyRunningException extends AppException {
  constructor(cause?: unknown) {
    super({
      statusCode: HttpStatus.CONFLICT,
      code: 'TIMER_ALREADY_RUNNING',
      message:
        'A timer is already running for this user. Stop it before starting a new one.',
      cause,
    });
  }
}

export class NoRunningTimerException extends AppException {
  constructor(cause?: unknown) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      code: 'NO_RUNNING_TIMER',
      message: 'No running timer found for this user.',
      cause,
    });
  }
}

export class TimeEntryNotFoundException extends AppException {
  constructor(id: string, cause?: unknown) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      code: 'TIME_ENTRY_NOT_FOUND',
      message: `Time entry "${id}" was not found.`,
      cause,
    });
  }
}

export class InvalidTimeRangeException extends AppException {
  constructor(cause?: unknown) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'INVALID_TIME_RANGE',
      message: 'endTime must be after startTime.',
      cause,
    });
  }
}
