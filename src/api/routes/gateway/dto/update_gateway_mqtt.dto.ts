import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGatewayMqttDto {
  @ApiProperty()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastConnectionTime: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  fwVersion: string;
}
