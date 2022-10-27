import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  SCHEDULER_JOBS,
  INTERVAL_JOBS,
} from '../../../../services/event-scheduler/event-scheduler.enum';

export class IntervalJobSchedulerEventDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({
    required: true,
    enum: [SCHEDULER_JOBS.INTERVAL_JOBS],
  })
  @IsNotEmpty()
  jobName: string;

  @ApiProperty({
    required: true,
    enum: [...Object.values(INTERVAL_JOBS)],
  })
  @IsNotEmpty()
  jobType: string;

  @ApiProperty()
  @IsOptional()
  data: any;
}
