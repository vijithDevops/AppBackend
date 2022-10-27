import { UpdateMedicationPrescriptionDto } from '../../../api/routes/medication-prescription/dto';

export class IUpdateMedicationPrescription extends UpdateMedicationPrescriptionDto {
  id: string;
  totalDosagePerDay?: number;
}
