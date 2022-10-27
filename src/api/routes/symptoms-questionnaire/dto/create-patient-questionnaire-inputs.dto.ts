import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PatientQuestionnaireInput {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  value: number;
}

export class CreatePatientQuestionnaireInputsDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: () => PatientQuestionnaireInput,
  })
  @IsNotEmpty()
  inputs: PatientQuestionnaireInput[];

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;
}
