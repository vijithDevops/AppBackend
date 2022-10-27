import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGatewayDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty()
  @IsOptional()
  fwVersion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  patientId?: string;
}
