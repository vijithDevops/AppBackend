import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class AddAppointmentUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ type: Array, required: true })
  @IsNotEmpty()
  users: string[];
}
