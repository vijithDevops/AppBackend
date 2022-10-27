import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetDefaultPatientAlertSettingsDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;
}
