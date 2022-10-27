import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSensorLastConnectionTimeDto {
  @ApiProperty()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastConnectionTime: Date;
}
