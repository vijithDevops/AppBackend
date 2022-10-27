import { ApiProperty } from '@nestjs/swagger';

export class PatientNoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  isDoctorAttn: boolean;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
