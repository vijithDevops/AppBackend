import { CreatePatientHealthInputDto } from '../../../api/routes/patient-health-input/dto/create-patient-health-input.dto';

export class ICreatePatientHealthInput extends CreatePatientHealthInputDto {
  patientId: string;
  calendarId: string;
}
