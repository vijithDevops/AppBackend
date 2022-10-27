import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class deleteUserNotificationDto {
  @ApiProperty({
    description: 'notification of user',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'notification Ids to be deleted',
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  notificationsId?: string[];
}
