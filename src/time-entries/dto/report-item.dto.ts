import { ReportRow } from '@/protos/generated/time-entries.v1.pb';
import { ApiProperty } from '@nestjs/swagger';

export class ReportItemDto implements ReportRow {
  @ApiProperty({ format: 'uuid', nullable: true })
  projectId: string | undefined;

  @ApiProperty({ example: 9000 })
  totalSeconds: number;

  @ApiProperty({ example: 2.5 })
  totalHours: number;

  @ApiProperty({ example: 3 })
  entryCount: number;
}
