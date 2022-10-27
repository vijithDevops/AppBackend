import {
  IsNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrendsSettingsColumnsOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @ArrayUnique()
  'columnsOrder': string[];
}