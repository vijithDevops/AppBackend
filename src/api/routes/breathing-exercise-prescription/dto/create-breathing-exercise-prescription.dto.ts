import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateBreathingExercisePrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  prescription: string;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  exerciseCountPerDay: number;

  @ApiProperty()
  @IsNotEmpty()
  patientId: string;
}
