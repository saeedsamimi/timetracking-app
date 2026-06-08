import { StartTimerRequest } from '@/protos/generated/time-entries.v1.pb';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTimeEntryDto implements StartTimerRequest {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ format: 'date-time', example: '2026-06-07T09:00:00.000Z' })
  @IsISO8601()
  startTime: string;

  @ApiProperty({ format: 'date-time', example: '2026-06-07T11:30:00.000Z' })
  @IsISO8601()
  endTime: string;
}
