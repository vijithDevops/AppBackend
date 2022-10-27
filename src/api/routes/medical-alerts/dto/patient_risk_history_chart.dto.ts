import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ResolutionType } from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class PatientRiskHistoryChartDto {
  @ApiProperty({
    description: 'Filter by patientId',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    enum: [...Object.values(ResolutionType)],
    default: ResolutionType.DAILY,
  })
  @IsNotEmpty()
  resolutionType: ResolutionType;

  @ApiProperty({ type: Date, required: true })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ type: Date, required: true })
  @IsNotEmpty()
  endDate: Date;
}
