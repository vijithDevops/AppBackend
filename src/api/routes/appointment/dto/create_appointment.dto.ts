import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { AppointmentType } from '../../../../models/appointment/entity/appointment.enum';
export class CreateAppointmentDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  title?: string;

  @ApiProperty({ type: Date, required: true })
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({ type: Date, required: true })
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ enum: [...Object.values(AppointmentType)], required: true })
  @IsNotEmpty()
  type: AppointmentType;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isAckRequired: boolean;

  @ApiProperty({ type: Boolean, required: false, default: 0 })
  @IsOptional()
  autoConfirm: boolean;

  @ApiProperty({ type: Array, required: false })
  @IsOptional()
  addUsers?: string[] = [];
}
