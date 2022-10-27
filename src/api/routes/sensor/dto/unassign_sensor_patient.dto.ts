import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnassignSensorPatientDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsNotEmpty()
  sensorId: string;
}
