import { ApiProperty } from '@nestjs/swagger';

export class PatientSymptomsInputResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  coughingScore: number;

  @ApiProperty()
  phlegmScore: number;

  @ApiProperty()
  chestTightnessScore: number;

  @ApiProperty()
  breathlessnessScore: number;

  @ApiProperty()
  limitedActivityScore: number;

  @ApiProperty()
  troubleSleepingScore: number;

  @ApiProperty()
  energyScore: number;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
