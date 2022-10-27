import { ApiProperty } from '@nestjs/swagger';

export class ClinicianNoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  isDiagnosis: boolean;

  @ApiProperty()
  isReminder: boolean;

  @ApiProperty()
  reminderAt: Date;

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
