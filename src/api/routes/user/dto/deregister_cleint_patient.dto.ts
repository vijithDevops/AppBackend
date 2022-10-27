import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeregisterClientPatientDto {
  @ApiProperty({
    description: 'Registration code of organization (To identify organization)',
    required: true,
  })
  @IsOptional()
  reg_code: string;

  @ApiProperty({
    description: 'Username for the patient',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(35)
  patient_id: string;

  @ApiProperty({
    description: 'Sensor MacId attached to patient in Application mode',
    required: true,
  })
  @IsOptional()
  sensor_id: string;
}
