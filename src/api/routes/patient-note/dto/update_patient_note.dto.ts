import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePatientNoteDto {
  @ApiProperty()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDoctorAttn?: boolean;
}
