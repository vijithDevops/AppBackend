import { ApiProperty } from '@nestjs/swagger';

export class PatientAlertSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  //
  @ApiProperty()
  patientNoteApplicability?: boolean;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  complianceScoreApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  complianceScoreAmber?: number;

  @ApiProperty({
    description: 'lower than',
  })
  complianceScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  medicationDaysMissedApplicability?: boolean;

  @ApiProperty()
  medicationDaysMissedAmber?: number;

  @ApiProperty()
  medicationDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  sensorDaysMissedApplicability?: boolean;

  @ApiProperty()
  sensorDaysMissedAmber?: number;

  @ApiProperty()
  sensorDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  breathingExerciseDaysMissedApplicability?: boolean;

  @ApiProperty()
  breathingExerciseDaysMissedAmber?: number;

  @ApiProperty()
  breathingExerciseDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  healthInputsDaysMissedApplicability?: boolean;

  @ApiProperty()
  healthInputsDaysMissedAmber?: number;

  @ApiProperty()
  healthInputsDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  symptomsDaysMissedApplicability?: boolean;

  @ApiProperty()
  symptomsDaysMissedAmber?: number;

  @ApiProperty()
  symptomsDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  symptomsScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
  })
  symptomsScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
  })
  symptomsScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  decompensationScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
  })
  decompensationScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
  })
  decompensationScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  ewsScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
  })
  ewsScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
  })
  ewsScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  heartRateLowerThanApplicability?: boolean;

  @ApiProperty()
  heartRateLowerThanAmber?: number;

  @ApiProperty()
  heartRateLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  heartRateHigherThanApplicability?: boolean;

  @ApiProperty()
  heartRateHigherThanAmber?: number;

  @ApiProperty()
  heartRateHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  respirationRateLowerThanApplicability?: boolean;

  @ApiProperty()
  respirationRateLowerThanAmber?: number;

  @ApiProperty()
  respirationRateLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  respirationRateHigherThanApplicability?: boolean;

  @ApiProperty()
  respirationRateHigherThanAmber?: number;

  @ApiProperty()
  respirationRateHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  temperatureApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
  })
  temperatureAmber?: number;

  @ApiProperty({
    description: 'higher than',
  })
  temperatureRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  spo2Applicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  spo2Amber?: number;

  @ApiProperty({
    description: 'lower than',
  })
  spo2Red?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  activityScoreApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  activityScoreAmber?: number;

  @ApiProperty({
    description: 'Higher than',
  })
  activityScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  bloodPressureSystolicLowerThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  bloodPressureSystolicLowerThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
  })
  bloodPressureSystolicLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  bloodPressureSystolicHigherThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  bloodPressureSystolicHigherThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
  })
  bloodPressureSystolicHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  bloodPressureDiastolicLowerThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  bloodPressureDiastolicLowerThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
  })
  bloodPressureDiastolicLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
  })
  bloodPressureDiastolicHigherThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
  })
  bloodPressureDiastolicHigherThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
  })
  bloodPressureDiastolicHigherThanRed?: number;
}
