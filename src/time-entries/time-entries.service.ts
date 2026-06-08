import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { TimeEntry } from './entities/time-entry.entity';
import {
  InvalidTimeRangeException,
  NoRunningTimerException,
  TimeEntryNotFoundException,
  TimerAlreadyRunningException,
} from './exceptions/time-entry.exceptions';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly repo: Repository<TimeEntry>,
  ) {}

  async startTimer(dto: StartTimerDto): Promise<TimeEntry> {
    const running = await this.repo.findOne({
      where: { userId: dto.userId, endTime: IsNull() },
    });
    if (running) {
      throw new TimerAlreadyRunningException();
    }

    const entry = this.repo.create({
      userId: dto.userId,
      projectId: dto.projectId ?? null,
      description: dto.description ?? null,
      startTime: new Date(),
      endTime: null,
      durationSeconds: null,
    });
    return this.repo.save(entry);
  }

  async stopTimer(userId: string): Promise<TimeEntry> {
    const running = await this.repo.findOne({
      where: { userId, endTime: IsNull() },
    });
    if (!running) {
      throw new NoRunningTimerException();
    }

    const endTime = new Date();
    running.endTime = endTime;
    running.durationSeconds = Math.round(
      (endTime.getTime() - running.startTime.getTime()) / 1000,
    );
    return this.repo.save(running);
  }

  async getRunning(userId: string): Promise<TimeEntry | null> {
    return this.repo.findOne({ where: { userId, endTime: IsNull() } });
  }

  async createManual(dto: CreateTimeEntryDto): Promise<TimeEntry> {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) {
      throw new InvalidTimeRangeException();
    }

    const entry = this.repo.create({
      userId: dto.userId,
      projectId: dto.projectId ?? null,
      description: dto.description ?? null,
      startTime: start,
      endTime: end,
      durationSeconds: Math.round((end.getTime() - start.getTime()) / 1000),
    });
    return this.repo.save(entry);
  }

  async findByUser(userId: string): Promise<TimeEntry[]> {
    return this.repo.find({ where: { userId }, order: { startTime: 'DESC' } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new TimeEntryNotFoundException(id);
    }
  }

  // Aggregated report: total seconds grouped by project
  async report(query: QueryReportDto) {
    const qb = this.repo
      .createQueryBuilder('e')
      .select('e.projectId', 'projectId')
      .addSelect('COALESCE(SUM(e.durationSeconds), 0)', 'totalSeconds')
      .addSelect('COUNT(e.id)', 'entryCount')
      .where('e.userId = :userId', { userId: query.userId })
      .andWhere('e.endTime IS NOT NULL')
      .groupBy('e.projectId');

    if (query.projectId) {
      qb.andWhere('e.projectId = :projectId', { projectId: query.projectId });
    }
    if (query.from) {
      qb.andWhere('e.startTime >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('e.startTime <= :to', { to: new Date(query.to) });
    }

    const rows = await qb.getRawMany<{
      projectId: string | null;
      totalSeconds: string;
      entryCount: string;
    }>();

    return rows.map((r) => ({
      projectId: r.projectId,
      totalSeconds: Number(r.totalSeconds),
      totalHours: Number((Number(r.totalSeconds) / 3600).toFixed(2)),
      entryCount: Number(r.entryCount),
    }));
  }
}
