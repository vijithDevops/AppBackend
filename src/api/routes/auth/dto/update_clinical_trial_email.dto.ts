import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClinicalTrialEmailDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  authToken: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
