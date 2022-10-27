import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientPatientDto {
  @ApiProperty({
    description:
      'Registration code to authorize registration(To identify organization)',
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
    description:
      'Sensor MacId that should be attached to patint in Application mode',
    required: true,
  })
  @IsOptional()
  sensor_id: string;
}
