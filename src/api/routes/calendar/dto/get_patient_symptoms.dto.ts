import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetPatientSymptomsDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    type: Date,
    description: 'Start date filter',
  })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    type: Date,
    description: 'End date filter',
  })
  @IsNotEmpty()
  endDate: Date;
}
