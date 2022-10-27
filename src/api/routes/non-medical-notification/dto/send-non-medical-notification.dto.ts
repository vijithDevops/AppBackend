import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class sendNonMedicalNotificationDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  fieldId: string;

  // @ApiProperty({ type: String, required: true })
  // @IsNotEmpty()
  // organizationId: string;

  // @ApiProperty({
  //   type: String,
  //   isArray: true,
  //   required: true,
  //   description: 'Patient user Ids to send notification',
  // })
  // @IsNotEmpty()
  // patientUserIds: string[];

  @ApiProperty({
    type: Number,
    isArray: true,
    required: true,
    description: 'Patient integer Ids to send notification',
  })
  @IsNotEmpty()
  patientIntegerIds: number[];

  @ApiProperty()
  @IsOptional()
  payload?: any = {};
}
