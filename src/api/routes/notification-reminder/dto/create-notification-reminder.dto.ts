import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';

export class CreateReminderTime {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Reminder hour in UTC',
  })
  @IsNotEmpty()
  @Min(0)
  @Max(23)
  hour: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Reminder minute in UTC',
  })
  @IsNotEmpty()
  @Min(0)
  @Max(59)
  minute: number;

  @ApiProperty({
    required: false,
    description: 'is reminder time in UTC',
  })
  @IsOptional()
  isUTC?: boolean;
}

export class CreateNotificationReminderDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    enum: [
      ReminderEvent.MEDICATION_REMINDER,
      ReminderEvent.BREATHING_EXERCISE_REMINDER,
    ],
    required: true,
  })
  @IsNotEmpty()
  type: ReminderEvent;

  @ApiProperty({
    required: true,
    isArray: true,
    type: () => CreateReminderTime,
  })
  reminderTimes: CreateReminderTime[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  medicationPrescriptionId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  breathingPrescriptionId?: string;
}
