import { UserAppointmentStatus } from '../entity/appointment.enum';
import { CreateAppointmentDto } from 'src/api/routes/appointment/dto';
import { AppointmentStatus } from '../entity/appointment.enum';

export class ICreateAppointment extends CreateAppointmentDto {
  status: AppointmentStatus;
  calendarId: string;
}

export class ICreateAppointmentUser {
  appointmentId: string;
  userId: string;
  status: UserAppointmentStatus;
  isOrganizer?: boolean;
  agoraUid?: number;
}
