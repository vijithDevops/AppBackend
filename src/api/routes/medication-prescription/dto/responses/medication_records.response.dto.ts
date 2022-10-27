import { ApiProperty } from '@nestjs/swagger';
import { MedicationPrescriptionResponseDto } from './medication_prescription.response.dto';

class MedicationRecord {
  id: string;
  dosage: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  day: number;
  month: number;
  year: number;
}

export class MedicationRecordsResponseDto {
  @ApiProperty()
  prescription: MedicationPrescriptionResponseDto;

  @ApiProperty({
    isArray: true,
    type: () => MedicationRecord,
  })
  records: MedicationRecord[];

  @ApiProperty()
  totalCount: number;
}
