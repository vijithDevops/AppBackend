import { ApiProperty } from '@nestjs/swagger';
import { UserAppointmentResponseDto } from './user_appointment.response.dto';

export class MonthlyCalendarAppointmentsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  day: number;

  @ApiProperty()
  month: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  userAppointments: UserAppointmentResponseDto;
}
