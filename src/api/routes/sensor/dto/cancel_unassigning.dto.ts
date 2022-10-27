import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelUnassigningDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;
}
