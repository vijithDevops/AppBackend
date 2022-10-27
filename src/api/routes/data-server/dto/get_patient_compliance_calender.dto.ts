import { ApiProperty } from '@nestjs/swagger';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { GetPatientComplianceCalendarDto } from '../../calendar/dto';

export class GetPatientComplianceCalendarForDataServerDto extends PartialType(
  OmitType(GetPatientComplianceCalendarDto, ['patientId'] as const),
) {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  patientIdInt: number;

  @ApiProperty({
    type: Date,
    default: new Date(),
    description:
      'Get patient compliance for the input date month (Default is current month)',
  })
  @IsOptional()
  date?: Date = new Date();
}
