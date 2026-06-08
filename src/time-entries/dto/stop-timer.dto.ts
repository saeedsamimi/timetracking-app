import { StopTimerRequest } from '@/protos/generated/time-entries.v1.pb';
import { IsUUID } from 'class-validator';

export class StopTimerDto implements StopTimerRequest {
  @IsUUID()
  userId: string;
}
