import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';

export class NotificationRemindersListPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Filter by reminder event type',
    enum: ReminderEvent,
    required: false,
  })
  @IsOptional()
  eventType?: ReminderEvent;

  @ApiProperty({ required: false })
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Filter by medication prescription',
    type: String,
    required: false,
  })
  @IsOptional()
  medicationPrescriptionId?: string;

  @ApiProperty({
    description: 'Filter by breathing exercise prescription',
    type: String,
    required: false,
  })
  @IsOptional()
  breathingPrescriptionId?: string;

  // @ApiProperty({
  //   description: 'Sort by reminder time',
  //   default: 'ASC',
  //   required: false,
  //   type: String,
  // })
  // @IsOptional()
  // sort?: 'ASC' | 'DESC' = 'ASC';
}
