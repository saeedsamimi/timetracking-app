import { FindByUserRequest } from '@/protos/generated/time-entries.v1.pb';
import { IsUUID } from 'class-validator';

export class FindByUserDto implements FindByUserRequest {
  @IsUUID()
  userId: string;
}
