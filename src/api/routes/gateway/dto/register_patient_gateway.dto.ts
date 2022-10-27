import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPatientGatewayDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // macId: string;
}
