import { ApiProperty } from '@nestjs/swagger';
import { BreathingExercisePrescriptionResponseDto } from 'src/api/routes/breathing-exercise-prescription/dto';

export class PatientBreathingInputResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  breathingPrescriptionId: string;

  @ApiProperty()
  breatingExercisePrescription: BreathingExercisePrescriptionResponseDto;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
