import { ApiProperty } from '@nestjs/swagger';

export class PatientHealthInputResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bloodPressureSystolic: number;

  @ApiProperty()
  bloodPressureDiastolic: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  bloodSugar: number;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
