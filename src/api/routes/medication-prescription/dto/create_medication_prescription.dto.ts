import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationPrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsOptional()
  startDate: Date;

  @ApiProperty()
  @IsOptional()
  endDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  refillDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  intakeFrequencyPerDay: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  dosePerIntake: number;

  @ApiProperty()
  @IsNotEmpty()
  patientId: string;
}
