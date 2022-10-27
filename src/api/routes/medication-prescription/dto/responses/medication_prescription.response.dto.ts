import { ApiProperty } from '@nestjs/swagger';

export class MedicationPrescriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  startDate?: Date;

  @ApiProperty()
  endDate?: Date;

  @ApiProperty()
  refillDate?: Date;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  intakeFrequencyPerDay: number;

  @ApiProperty()
  dosePerIntake: number;

  @ApiProperty()
  totalDosagePerDay: number;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
