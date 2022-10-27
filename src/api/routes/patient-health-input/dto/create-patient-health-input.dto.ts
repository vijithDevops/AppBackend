import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePatientHealthInputDto {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  bloodPressureSystolic?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  bloodPressureDiastolic?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  bloodSugar?: number;
}
