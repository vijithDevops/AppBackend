import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';
import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';
import { eventCategory } from 'src/models/notification_event_master/entity/notification_event.enum';

export class getUserNotificationDtoPaginated extends PaginationDto {
  @ApiProperty({
    description: 'Filter by actorId',
    type: String,
    required: false,
  })
  @IsOptional()
  actorId?: string;

  @ApiProperty({
    description: 'Filter by events',
    required: false,
    enum: NOTIFICATION_EVENT,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  event?: NOTIFICATION_EVENT[];

  @ApiProperty({
    description: 'Filter by event category',
    required: false,
    enum: eventCategory,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  eventCategory?: eventCategory[];

  @ApiProperty({
    description: 'Filter by read status',
    required: false,
  })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    description: 'Filter by acknowledge status',
    required: false,
  })
  @IsOptional()
  isAcknowledged?: boolean;
}
