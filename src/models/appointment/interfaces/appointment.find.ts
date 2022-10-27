import {
  AppointmentCategory,
  AppointmentStatus,
  AppointmentType,
} from '../entity/appointment.enum';

export class IFindAllAppointemntsOptions {
  organizationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus[];
  type?: AppointmentType;
  category?: AppointmentCategory;
  calendarId?: string;
  skip: number;
  limit: number;
  field?: 'createdAt' | 'startTime' | 'endTime' | 'type' | 'status' =
    'createdAt';
  sort?: 'ASC' | 'DESC' = 'DESC';
  userId?: string;
  search?: string;
}

export class IFindUserAppointemnts {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  calendarId?: string;
  field?: 'createdAt' | 'startTime' | 'endTime' | 'type' | 'status';
  sort?: 'ASC' | 'DESC';
  userId?: string;
  search?: string;
  limit?: number;
  startDate: Date;
  endDate: Date;
}

export class IAddAppointmentUsersPaginateFilter {
  skip: number;
  limit: number;
  patientId: string;
  organizationId: string;
  search?: string;
  excludeUserIds?: string[];
  appointmentId?: string;
}
