import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMedicationPrescriptionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  refillDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  intakeFrequencyPerDay: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  dosePerIntake: number;
}
