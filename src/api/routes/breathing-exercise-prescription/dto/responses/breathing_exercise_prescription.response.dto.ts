import { ApiProperty } from '@nestjs/swagger';

export class BreathingExercisePrescriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  prescription: string;

  @ApiProperty()
  startDate?: Date;

  @ApiProperty()
  endDate?: Date;

  @ApiProperty()
  exerciseCountPerDay: number;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
