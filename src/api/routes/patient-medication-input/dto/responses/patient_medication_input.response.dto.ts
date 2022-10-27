import { ApiProperty } from '@nestjs/swagger';
import { MedicationPrescriptionResponseDto } from 'src/api/routes/medication-prescription/dto';

export class PatientMedicationInputResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dosage: number;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  medicationPrescription: MedicationPrescriptionResponseDto;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
