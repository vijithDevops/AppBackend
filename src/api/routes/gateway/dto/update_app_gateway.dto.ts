import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppGatewayDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  lastConnectionTime: Date = new Date();

  @ApiProperty({ required: false })
  @IsOptional()
  fwVersion: string;
}
