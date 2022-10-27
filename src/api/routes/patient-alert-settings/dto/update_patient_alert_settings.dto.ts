import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateVitalSignsDto } from '../../medical-alerts/dto';

export class UpdatePatientAlertSettingsDto {
  @ApiProperty()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: () => UpdateVitalSignsDto,
  })
  vitalSigns?: UpdateVitalSignsDto[];

  //
  @ApiProperty({
    description: 'is applicable to patient Notes',
    required: false,
    default: false,
  })
  @IsOptional()
  patientNoteApplicability?: boolean;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  complianceScoreApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  complianceScoreAmber?: number;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  complianceScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  medicationDaysMissedApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  medicationDaysMissedAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  medicationDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  sensorDaysMissedApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  sensorDaysMissedAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  sensorDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  breathingExerciseDaysMissedApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  breathingExerciseDaysMissedAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  breathingExerciseDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  healthInputsDaysMissedApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  healthInputsDaysMissedAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  healthInputsDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  symptomsDaysMissedApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  symptomsDaysMissedAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  symptomsDaysMissedRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  symptomsScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  symptomsScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  symptomsScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  decompensationScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  decompensationScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  decompensationScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  ewsScoreApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  ewsScoreAmber?: number;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  ewsScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  heartRateLowerThanApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  heartRateLowerThanAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  heartRateLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  heartRateHigherThanApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  heartRateHigherThanAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  heartRateHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  respirationRateLowerThanApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  respirationRateLowerThanAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  respirationRateLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  respirationRateHigherThanApplicability?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  respirationRateHigherThanAmber?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  respirationRateHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  temperatureApplicability?: boolean;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  temperatureAmber?: number;

  @ApiProperty({
    description: 'higher than',
    required: false,
  })
  @IsOptional()
  temperatureRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  spo2Applicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  spo2Amber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  spo2Red?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  activityScoreApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  activityScoreAmber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  activityScoreRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  bloodPressureSystolicLowerThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  bloodPressureSystolicLowerThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  bloodPressureSystolicLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  bloodPressureSystolicHigherThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  bloodPressureSystolicHigherThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  bloodPressureSystolicHigherThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  bloodPressureDiastolicLowerThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  bloodPressureDiastolicLowerThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  bloodPressureDiastolicLowerThanRed?: number;

  //
  @ApiProperty({
    description: 'is applicable',
    required: false,
    default: false,
  })
  @IsOptional()
  bloodPressureDiastolicHigherThanApplicability?: boolean;

  @ApiProperty({
    description: 'lower than',
    required: false,
  })
  @IsOptional()
  bloodPressureDiastolicHigherThanAmber?: number;

  @ApiProperty({
    description: 'Higher than',
    required: false,
  })
  @IsOptional()
  bloodPressureDiastolicHigherThanRed?: number;
}
