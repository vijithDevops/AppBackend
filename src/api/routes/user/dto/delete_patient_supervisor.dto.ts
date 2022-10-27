import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class DeletePatientSupervisorDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  userId: string;
}
