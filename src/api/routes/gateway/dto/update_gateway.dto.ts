import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateGatewayDto } from './create_gateway.dto';

export class UpdateGatewayDto extends PartialType(CreateGatewayDto) {
  @ApiProperty()
  @IsOptional()
  lastConnectionTime?: Date;
}
