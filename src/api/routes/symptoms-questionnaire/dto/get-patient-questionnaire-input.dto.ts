import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPatientQuestionnaireInputsDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Filter by date',
    required: false,
    default: new Date(),
  })
  @IsOptional()
  date?: Date;
}
