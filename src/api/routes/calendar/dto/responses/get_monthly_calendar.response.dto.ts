import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class MonthlyCalendarResponseDto {
  @ApiProperty({
    example: {
      '2021-6-1': {
        id: 'string',
        date: '2021-06-01',
        day: 1,
        month: 6,
        year: 2021,
        patientMedicationInputs: 2,
        patientSymptomsInputs: 1,
        clinicianNotes: 0,
        patientNotes: 0,
        userAppointments: 4,
      },
    },
  })
  @IsNotEmpty()
  calendarData: any;

  @ApiProperty()
  @IsOptional()
  alerts?: {
    medication?: { amberAlert: boolean; redAlert: boolean };
    symptoms?: { amberAlert: boolean; redAlert: boolean };
    clinicianNotes?: boolean;
    patientNotes: boolean;
  };
}
