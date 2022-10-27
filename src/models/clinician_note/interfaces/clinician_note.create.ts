import { CreateClinicianNoteDto } from '../../../api/routes/clinician-note/dto';

export class ICreateClinicianNote extends CreateClinicianNoteDto {
  doctorId: string;
  calendarId: string;
}
