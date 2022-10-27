import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateReminderActiveStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  isActive: boolean;
}
