import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PatientComplianceCalendarResponseDto {
  @ApiProperty({
    example: {
      '2021-6-1': {
        healthInputMissed: true,
        symptomsInputMissed: true,
        medicationInputMissed: true,
        breathingInputMissed: true,
      },
    },
  })
  @IsNotEmpty()
  complianceCalendar: any;

  @ApiProperty({
    example: {
      healthInputMissed: 0,
      symptomsInputMissed: 0,
      medicationInputMissed: 0,
      breathingInputMissed: 0,
    },
  })
  @IsNotEmpty()
  monthlyComplianceCount: {
    healthInputMissed: number;
    symptomsInputMissed: number;
    medicationInputMissed: number;
    breathingInputMissed: number;
  };
}
