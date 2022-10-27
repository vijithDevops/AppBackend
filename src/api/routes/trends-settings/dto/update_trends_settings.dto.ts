import {
  IsNotEmpty,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { GraphTypes } from '../../../../models/trends_settings/constants/graphtypes.enum';

export class UpdatePatientTrendsOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @ArrayUnique()
  @ArrayMaxSize(11)
  @ArrayMinSize(11)
  @IsEnum(GraphTypes, { each: true })
  refArr: GraphTypes[];

  @ApiProperty()
  @IsNotEmpty()
  patientId: string;
}
