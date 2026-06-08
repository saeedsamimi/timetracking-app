import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { FindByUserDto } from './dto/find-by-user-id.dto';
import { GetRunningDto } from './dto/get-running.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { RemoveDto } from './dto/remove.dto';
import { ReportItemDto } from './dto/report-item.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeEntry } from './entities/time-entry.entity';
import { TimeEntriesService } from './time-entries.service';

@ApiTags('time-entries')
@Controller({
  path: 'time-entries',
  version: '1',
})
export class TimeEntriesController {
  constructor(private readonly service: TimeEntriesService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new timer for a user.' })
  @ApiCreatedResponse({ type: TimeEntry })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'A timer is already running for this user.',
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  start(@Body() dto: StartTimerDto) {
    return this.service.startTimer(dto);
  }

  @Post('stop/:userId')
  @ApiOperation({ summary: "Stop the user's running timer." })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ type: TimeEntry })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'No running timer found.',
  })
  stop(@Param() params: StopTimerDto) {
    return this.service.stopTimer(params.userId);
  }

  @Get('running/:userId')
  @ApiOperation({ summary: "Get the user's currently running timer, if any." })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ type: TimeEntry })
  running(@Param() params: GetRunningDto) {
    return this.service.getRunning(params.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Manually log a completed time entry.' })
  @ApiCreatedResponse({ type: TimeEntry })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'endTime must be after startTime.',
  })
  create(@Body() dto: CreateTimeEntryDto) {
    return this.service.createManual(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List all time entries for a user.' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ type: [TimeEntry] })
  byUser(@Param() params: FindByUserDto) {
    return this.service.findByUser(params.userId);
  }

  @Get('report')
  @ApiOperation({ summary: 'Aggregated time report grouped by project.' })
  @ApiOkResponse({ type: [ReportItemDto] })
  report(@Query() query: QueryReportDto) {
    return this.service.report(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a time entry.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param() params: RemoveDto) {
    return this.service.remove(params.id);
  }
}
