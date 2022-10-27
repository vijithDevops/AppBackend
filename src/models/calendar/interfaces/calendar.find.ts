import {
  AppointmentStatus,
  AppointmentType,
} from 'src/models/appointment/entity/appointment.enum';

export class IMonthlyCalendarRawData {
  id: string;
  date: Date;
  day: number;
  month: number;
  year: number;
  medication_inputs?: string;
  symptoms_inputs?: string;
  questionnaire_inputs?: string;
  health_inputs?: string;
  clinician_notes?: string;
  patient_notes?: string;
  face_to_face_appointments: string;
  video_call_appointments: string;
}

export class IPatientInputsCalendarRawData {
  id: string;
  date: Date;
  day: number;
  month: number;
  year: number;
  medication_inputs: string;
  breathing_inputs: string;
  symptoms_inputs: string;
  questionnaire_inputs: string;
  health_inputs: string;
}

export class IFindUserCalendarAppointmentsBetweenDates {
  startDate: Date;
  endDate: Date;
  userId: string;
  organizationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  search?: string;
}
