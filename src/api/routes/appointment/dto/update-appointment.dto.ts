import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../../models/appointment/entity/appointment.enum';

export class UpdateAppointmentDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  title?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ enum: [...Object.values(AppointmentType)], required: false })
  @IsOptional()
  type?: AppointmentType;

  @ApiProperty({
    enum: [
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.REJECTED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
    ],
    required: false,
  })
  @IsOptional()
  status?:
    | AppointmentStatus.PENDING
    | AppointmentStatus.CONFIRMED
    | AppointmentStatus.IN_PROGRESS
    | AppointmentStatus.REJECTED
    | AppointmentStatus.CANCELLED
    | AppointmentStatus.COMPLETED;
}
