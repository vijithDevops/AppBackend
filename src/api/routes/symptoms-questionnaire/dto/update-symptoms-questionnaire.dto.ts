import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QuestionnaireType } from 'src/models/symptoms-questionnaire/entity/symptoms-questionnaire.enum';

export class UpdateSymptomsQustionnaireDto {
  @ApiProperty({ type: String })
  @IsOptional()
  question?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'type of questionnaire',
    enum: QuestionnaireType,
    required: false,
  })
  @IsOptional()
  type?: QuestionnaireType;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @IsOptional()
  scale?: string[];
}
