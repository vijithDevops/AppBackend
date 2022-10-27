import { CreateMedicationPrescriptionDto } from '../../../api/routes/medication-prescription/dto';

export class ICreateMedicationPrescription extends CreateMedicationPrescriptionDto {
  calendarId: string;
  totalDosagePerDay: number;
}
