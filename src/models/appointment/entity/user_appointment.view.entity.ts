import {
  ViewEntity,
  ViewColumn,
  Connection,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentUsers } from './appointment_users.entity';
import {
  AppointmentStatus,
  AppointmentType,
  UserAppointmentStatus,
} from './appointment.enum';
import { Calendar } from '../../calendar/entity/calendar.entity';
import { User } from 'src/models/user/entity/user.entity';

@ViewEntity({
  name: 'user_appointments_view',
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select([
        'appointmentUsers.id AS id',
        'appointmentUsers.appointmentId AS appointment_id',
        'appointmentUsers.status AS user_status',
        'appointmentUsers.userId AS user_id',
        'appointmentUsers.agoraUid AS agora_uid',
        'appointmentUsers.isOrganizer AS is_organizer',
        'appointment.calendarId AS calendar_id',
        'appointment.patientId AS patient_id',
        'appointment.doctorId AS doctor_id',
        'appointment.title AS title',
        'appointment.startTime AS start_time',
        'appointment.endTime AS end_time',
        'appointment.status AS appointment_status',
        'appointment.type AS type',
        'appointment.isAckRequired AS is_ack_required',
        'appointment.videoUrl AS video_url',
        'appointment.organizationId AS organization_id',
      ])
      .from(Appointment, 'appointment')
      .leftJoin(
        AppointmentUsers,
        'appointmentUsers',
        'appointmentUsers.appointmentId = appointment.id',
      ),
})
export class UserAppointments {
  @ViewColumn()
  id: string;

  @ViewColumn({ name: 'appointment_id' })
  appointmentId: string;

  @ViewColumn({ name: 'user_status' })
  userStatus: UserAppointmentStatus;

  @ViewColumn({ name: 'user_id' })
  userId: string;

  @ViewColumn({ name: 'agora_uid' })
  agoraUid: string;

  @ViewColumn({ name: 'is_organizer' })
  isOrganizer: boolean;

  // @ViewColumn({ name: 'calendar_id' })
  // calendarId: string;

  @ViewColumn({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.userAppointments)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;

  @ViewColumn({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.userAppointmentsPatient)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ViewColumn({ name: 'doctor_id' })
  doctorId: string;
  @ManyToOne(() => User, (user) => user.userAppointmentsDoctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ViewColumn({ name: 'title' })
  title?: string;

  @ViewColumn({ name: 'start_time' })
  startTime: Date;

  @ViewColumn({ name: 'end_time' })
  endTime: Date;

  @ViewColumn({ name: 'appointment_status' })
  appointmentStatus: AppointmentStatus;

  @ViewColumn({ name: 'type' })
  type: AppointmentType;

  @ViewColumn({ name: 'is_ack_required' })
  isAckRequired: boolean;

  @ViewColumn({ name: 'video_url' })
  videoUrl: string;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;
}
