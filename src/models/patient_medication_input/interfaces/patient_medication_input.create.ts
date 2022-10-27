import { CreatePatientMedicationInputDto } from '../../../api/routes/patient-medication-input/dto';

export class ICreatePatientMedicationInput extends CreatePatientMedicationInputDto {
  patientId: string;
  calendarId: string;
}
