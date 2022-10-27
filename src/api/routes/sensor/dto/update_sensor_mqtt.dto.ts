import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSensorMqttDto {
  @ApiProperty()
  @IsNotEmpty()
  macId: string;

  @ApiProperty()
  @IsNotEmpty()
  isRegistered: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  lastConnectionTime: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  registeredTime: Date;
}
