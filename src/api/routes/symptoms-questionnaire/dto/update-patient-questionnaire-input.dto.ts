import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PatientInputQuestionnaire {
  @ApiProperty({ type: String })
  @IsOptional()
  inputQuestionId: string;

  @ApiProperty({ type: String })
  @IsOptional()
  questionId: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  value: number;
}

export class UpdatePatientQuestionnaireInputsDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  inputMasterId: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: () => PatientInputQuestionnaire,
  })
  @IsNotEmpty()
  inputs: PatientInputQuestionnaire[];
}
