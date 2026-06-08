import { GrpcExceptionsFilter } from '@/common/filters/grpc-exceptions.filter';
import { GrpcValidationPipe } from '@/common/pipes/grpc-validation.pipe';
import {
  RemoveResponse,
  ReportResponse,
  RunningTimer,
  TimeEntriesServiceController,
  TimeEntriesServiceControllerMethods,
  TimeEntry,
  TimeEntryList,
} from '@/protos/generated/time-entries.v1.pb';
import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { FindByUserDto } from './dto/find-by-user-id.dto';
import { GetRunningDto } from './dto/get-running.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { RemoveDto } from './dto/remove.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeEntry as TimeEntryEntity } from './entities/time-entry.entity';
import { TimeEntriesService } from './time-entries.service';

@Controller()
@UsePipes(new GrpcValidationPipe())
@UseFilters(new GrpcExceptionsFilter())
@TimeEntriesServiceControllerMethods()
export class TimeEntriesGrpcController implements TimeEntriesServiceController {
  constructor(private readonly service: TimeEntriesService) {}

  async startTimer(@Payload() request: StartTimerDto): Promise<TimeEntry> {
    const entry = await this.service.startTimer(request);
    return this.toProto(entry);
  }

  async stopTimer(@Payload() request: StopTimerDto): Promise<TimeEntry> {
    const entry = await this.service.stopTimer(request.userId);
    return this.toProto(entry);
  }

  async getRunning(@Payload() request: GetRunningDto): Promise<RunningTimer> {
    const entry = await this.service.getRunning(request.userId);
    return entry
      ? { running: true, entry: this.toProto(entry) }
      : { running: false };
  }

  async createManual(
    @Payload() request: CreateTimeEntryDto,
  ): Promise<TimeEntry> {
    const entry = await this.service.createManual(request);
    return this.toProto(entry);
  }

  async findByUser(@Payload() request: FindByUserDto): Promise<TimeEntryList> {
    const entries = await this.service.findByUser(request.userId);
    return {
      items: entries.map((e) => this.toProto(e)),
    };
  }

  async remove(@Payload() request: RemoveDto): Promise<RemoveResponse> {
    await this.service.remove(request.id);
    return { success: true };
  }

  async report(@Payload() request: QueryReportDto): Promise<ReportResponse> {
    const reports = await this.service.report(request);
    return {
      rows: reports.map((r) => ({
        projectId: r.projectId ?? undefined,
        totalSeconds: r.totalSeconds,
        totalHours: r.totalHours,
        entryCount: r.entryCount,
      })),
    };
  }

  private toProto(entry: TimeEntryEntity): TimeEntry {
    return {
      id: entry.id,
      userId: entry.userId,
      startTime: entry.startTime?.toISOString() ?? '',
      endTime: entry.endTime?.toISOString() ?? '',
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      projectId: entry.projectId ?? undefined,
      description: entry.description ?? undefined,
      durationSeconds: entry.durationSeconds ?? undefined,
    };
  }
}
