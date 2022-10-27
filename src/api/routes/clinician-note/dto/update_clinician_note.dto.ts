import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClinicianNoteDto {
  @ApiProperty()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDiagnosis?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  isReminder?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  reminderAt?: string;
}
