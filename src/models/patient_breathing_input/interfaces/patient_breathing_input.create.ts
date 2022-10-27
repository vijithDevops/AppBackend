import { CreatePatientBreathingInputDto } from '../../../api/routes/patient-breathing-input/dto';

export class ICreatePatientBreathingInput extends CreatePatientBreathingInputDto {
  patientId: string;
  breathingPrescriptionId: string;
  calendarId: string;
}
