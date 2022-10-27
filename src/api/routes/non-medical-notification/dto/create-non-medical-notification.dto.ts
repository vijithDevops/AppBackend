import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNonMedicalNotificationDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  message: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  notifyClinician?: boolean;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  notifyCaregiver?: boolean;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  patientAckRequired?: boolean;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  caregiverAckRequired?: boolean;
}
