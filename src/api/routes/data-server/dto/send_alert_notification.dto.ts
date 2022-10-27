import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ALERT_TYPE,
  DATA_SERVER_PATIENT_ALERTS,
} from 'src/config/master-data-constants';

export class SendAlertNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  patientIdInt: number;

  @ApiProperty({ enum: ALERT_TYPE, required: true })
  @IsNotEmpty()
  alertType: ALERT_TYPE;

  @ApiProperty({
    enum: DATA_SERVER_PATIENT_ALERTS,
    required: true,
  })
  @IsNotEmpty()
  biomarker: DATA_SERVER_PATIENT_ALERTS;
}
