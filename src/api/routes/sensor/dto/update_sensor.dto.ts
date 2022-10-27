import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateSensorDto } from './create_sensor.dto';

export class UpdateSensorDto extends PartialType(CreateSensorDto) {
  @ApiProperty()
  @IsOptional()
  lastConnectionTime?: Date;

  @ApiProperty()
  @IsOptional()
  registeredTime?: Date;

  @ApiProperty()
  @IsOptional()
  isRegistered?: boolean;
}
