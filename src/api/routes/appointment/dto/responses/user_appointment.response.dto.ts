import { ApiProperty } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentType,
  UserAppointmentStatus,
} from 'src/models/appointment/entity/appointment.enum';

export class UserAppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appointmentId: string;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  appointmentStatus: AppointmentStatus;

  @ApiProperty()
  type: AppointmentType;

  @ApiProperty()
  userStatus: UserAppointmentStatus;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isOrganizer: boolean;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
