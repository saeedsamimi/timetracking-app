import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('time_entries')
@Index(['userId', 'endTime'])
export class TimeEntry {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column('uuid')
  userId: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  @Column('uuid', { nullable: true })
  projectId: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Column({ type: 'timestamptz' })
  startTime: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  endTime: Date | null;

  @ApiProperty({ nullable: true, description: 'Duration in seconds.' })
  @Column({ type: 'integer', nullable: true })
  durationSeconds: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
