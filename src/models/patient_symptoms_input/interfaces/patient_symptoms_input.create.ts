import { CreatePatientSymptomsInputDto } from '../../../api/routes/patient-symptoms-input/dto';

export class ICreatePatientSymptomsInput extends CreatePatientSymptomsInputDto {
  patientId: string;
  calendarId: string;
  totalScore?: number;
}
