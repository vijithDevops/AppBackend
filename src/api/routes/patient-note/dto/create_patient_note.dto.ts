import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientNoteDto {
  @ApiProperty()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDoctorAttn?: boolean;
}
