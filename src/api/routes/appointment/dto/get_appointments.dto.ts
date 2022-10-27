import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/utils/dto/paginate.dto';
import {
  AppointmentCategory,
  AppointmentStatus,
  AppointmentType,
} from '../../../../models/appointment/entity/appointment.enum';

export class getAppointmentsDtoPaginated extends PaginationDto {
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
    description: 'Filter by organization for admin',
    type: String,
    required: false,
  })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({
    description: 'Filter by user appointments',
    type: String,
    required: false,
  })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Filter by appointment type',
    enum: AppointmentType,
    required: false,
  })
  @IsOptional()
  type?: AppointmentType;

  @ApiProperty({
    description: 'Filter by appointment by category',
    enum: AppointmentCategory,
    required: false,
  })
  @IsOptional()
  category?: AppointmentCategory;

  @ApiProperty({
    description: 'Filter by status',
    enum: AppointmentStatus,
    required: false,
    type: [String],
    isArray: true,
  })
  @IsOptional()
  status?: AppointmentStatus[];

  @ApiProperty({
    description: 'Filter by date',
    required: false,
  })
  @IsOptional()
  date?: string;

  @ApiProperty({
    description:
      'Sory by field names: createdAt || startTime || endTime || type || status : Default sort field is createdAt',
    default: 'createdAt',
    required: false,
    type: String,
  })
  @IsOptional()
  field?: 'createdAt' | 'startTime' | 'endTime' | 'type' | 'status' =
    'createdAt';

  @ApiProperty({
    description: 'Sort by field ASC | DESC: default sort is DESC',
    default: 'DESC',
    required: false,
    type: String,
  })
  @IsOptional()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
