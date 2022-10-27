import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreatePatientMedicationInputDto {
  @ApiProperty()
  @IsNotEmpty()
  medicationPrescriptionId: string;

  @ApiProperty({ type: Number, required: true })
  @IsInt()
  dosage: number;

  @ApiProperty()
  @IsOptional()
  notes?: string;
}

export class CreatePatientMedicationInputsDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: () => CreatePatientMedicationInputDto,
  })
  medications: CreatePatientMedicationInputDto[];
}
