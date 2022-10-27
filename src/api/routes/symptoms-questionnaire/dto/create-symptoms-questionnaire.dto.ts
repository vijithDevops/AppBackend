import { QuestionnaireType } from './../../../../models/symptoms-questionnaire/entity/symptoms-questionnaire.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSymptomsQuestionnaireDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  question: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  keyword: string;

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({
    description: 'type of questionnaire',
    enum: QuestionnaireType,
    required: false,
  })
  @IsOptional()
  type?: QuestionnaireType;

  @ApiProperty({
    required: true,
    type: String,
    isArray: true,
  })
  @IsNotEmpty()
  scale: string[];
}
