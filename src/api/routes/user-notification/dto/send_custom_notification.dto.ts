import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CUSTOM_ALERT_TYPE } from 'src/config/master-data-constants';

export class SendCustomNotificationDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ enum: CUSTOM_ALERT_TYPE, required: true })
  @IsNotEmpty()
  alertType: CUSTOM_ALERT_TYPE;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  messageText?: string;
}
