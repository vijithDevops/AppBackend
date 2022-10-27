import { CreatePatientNoteDto } from '../../../api/routes/patient-note/dto';

export class ICreatePatientNote extends CreatePatientNoteDto {
  patientId: string;
  doctorId?: string;
  calendarId: string;
}
