import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPatientComplianceCalendarDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    type: Date,
    default: new Date(),
    description:
      'Get patient compliance for the input date month (Default is current month)',
  })
  @IsOptional()
  date?: Date = new Date();
}
