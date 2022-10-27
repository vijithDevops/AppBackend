import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindPatientDevicesByPatientIdIntDto {
  @ApiProperty()
  @IsNotEmpty()
  patientIdInt: number;
}
