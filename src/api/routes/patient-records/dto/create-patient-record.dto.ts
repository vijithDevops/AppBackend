import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientRecordType } from 'src/models/patient_records/entity/patient_record.enum';

export class CreatePatientRecordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ enum: [...Object.values(PatientRecordType)], required: true })
  @IsNotEmpty()
  type: PatientRecordType;

  @ApiProperty({
    type: Array,
    required: false,
    description: 'id of the uploaded files',
  })
  @IsOptional()
  fileIds?: string[] = [];

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;
}
