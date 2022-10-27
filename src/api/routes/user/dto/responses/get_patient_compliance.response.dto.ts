import { ApiProperty } from '@nestjs/swagger';

export class PatientComplianceResponseDto {
  @ApiProperty()
  healthInputMissed: number;

  @ApiProperty()
  symptomsInputMissed: number;

  @ApiProperty()
  medicationInputMissed: number;

  @ApiProperty()
  breathingInputMissed: number;
}
