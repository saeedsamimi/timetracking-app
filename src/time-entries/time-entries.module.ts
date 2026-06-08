import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntry } from './entities/time-entry.entity';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntriesGrpcController } from './time-entries.grpc.controller';
import { TimeEntriesService } from './time-entries.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry])],
  controllers: [TimeEntriesController, TimeEntriesGrpcController],
  providers: [TimeEntriesService],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}
