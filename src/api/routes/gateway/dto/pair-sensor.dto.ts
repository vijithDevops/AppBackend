import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PairSensorDto {
  @ApiProperty()
  @IsNotEmpty()
  sensorId: string;
}
