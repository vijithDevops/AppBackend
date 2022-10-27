import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientRecordType } from 'src/models/patient_records/entity/patient_record.enum';

export class CreatePatientRecordResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ enum: [...Object.values(PatientRecordType)] })
  @IsNotEmpty()
  type: PatientRecordType;

  @ApiProperty({
    description: 'id of the file',
  })
  @IsOptional()
  fileId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
