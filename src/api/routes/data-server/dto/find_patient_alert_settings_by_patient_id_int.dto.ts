import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindPatientAlertSettingsByPatientIdIntDto {
  @ApiProperty()
  @IsNotEmpty()
  patientIdInt: number;
}
