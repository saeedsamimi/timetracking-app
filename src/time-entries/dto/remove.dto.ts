import { RemoveRequest } from '@/protos/generated/time-entries.v1.pb';
import { IsUUID } from 'class-validator';

export class RemoveDto implements RemoveRequest {
  @IsUUID()
  id: string;
}
