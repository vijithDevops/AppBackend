import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateReminderTime } from './create-notification-reminder.dto';

export class UpdateNotificationReminderDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: () => CreateReminderTime,
  })
  reminderTimes: CreateReminderTime[];
}
