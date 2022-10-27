import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClinicalTrialDto {
  @ApiProperty({
    description: 'Id of Organization or Hospital',
    required: true,
  })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    description: 'Username for the patient',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(35)
  username: string;
}
