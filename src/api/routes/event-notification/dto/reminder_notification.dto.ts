import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { string } from 'joi';
import {
  SCHEDULER_JOBS,
  SCHEDULED_REMINDER,
  DAILY_REMINDER,
} from '../../../../services/event-scheduler/event-scheduler.enum';

export class ReminderNotificationDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  reminderId: string;

  @ApiProperty({
    required: true,
    enum: [SCHEDULER_JOBS.DAILY_REMINDER, SCHEDULER_JOBS.SCHEDULED_REMINDER],
  })
  @IsNotEmpty()
  reminderName: string;

  @ApiProperty({
    required: true,
    enum: [
      ...Object.values(SCHEDULED_REMINDER),
      ...Object.values(DAILY_REMINDER),
    ],
  })
  @IsNotEmpty()
  reminderType: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty()
  @IsOptional()
  data: any;
}
