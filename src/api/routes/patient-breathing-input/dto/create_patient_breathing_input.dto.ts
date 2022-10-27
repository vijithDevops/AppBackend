import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePatientBreathingInputDto {
  @ApiProperty({ type: Boolean, required: true })
  @IsNotEmpty()
  isCompleted: boolean;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  breathingPrescriptionId: string;
}

export class CreatePatientBreathingInputsDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: () => CreatePatientBreathingInputDto,
  })
  breathingInputs: CreatePatientBreathingInputDto[];
}
