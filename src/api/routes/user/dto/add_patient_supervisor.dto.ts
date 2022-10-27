import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class AddPatientSupervisorDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ type: Array, required: true })
  @IsNotEmpty()
  userIds: string[];
}
