import { GetRunningRequest } from '@/protos/generated/time-entries.v1.pb';
import { IsUUID } from 'class-validator';

export class GetRunningDto implements GetRunningRequest {
  @IsUUID()
  userId: string;
}
