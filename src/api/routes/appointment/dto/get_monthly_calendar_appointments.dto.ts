import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../../models/appointment/entity/appointment.enum';

export class getMonthlyCalendarAppointmentsDto {
  @ApiProperty({
    description: 'calendar start date',
    required: true,
  })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'calendar end date',
    required: true,
  })
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Search user by patient name or title',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: false,
  })
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    description: 'Filter by doctorId',
    type: String,
    required: false,
  })
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    description: 'Filter by organization Id for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    description: 'Filter by appointemnt type',
    enum: AppointmentType,
    required: false,
  })
  @IsOptional()
  type?: AppointmentType;

  @ApiProperty({
    description: 'Filter by status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsOptional()
  status?: AppointmentStatus;
}
