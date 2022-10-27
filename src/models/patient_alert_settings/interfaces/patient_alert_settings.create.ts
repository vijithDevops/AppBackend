export class ICreateOrUpdatePatientAlertSettings {
  patientId: string;
  complianceScoreApplicability?: boolean;
  complianceScoreAmber?: number;
  complianceScoreRed?: number;
  medicationDaysMissedApplicability?: boolean;
  medicationDaysMissedAmber?: number;
  medicationDaysMissedRed?: number;
  sensorDaysMissedApplicability?: boolean;
  sensorDaysMissedAmber?: number;
  sensorDaysMissedRed?: number;
  breathingExerciseDaysMissedApplicability?: boolean;
  breathingExerciseDaysMissedAmber?: number;
  breathingExerciseDaysMissedRed?: number;
  healthInputsDaysMissedApplicability?: boolean;
  healthInputsDaysMissedAmber?: number;
  healthInputsDaysMissedRed?: number;
  symptomsDaysMissedApplicability?: boolean;
  symptomsDaysMissedAmber?: number;
  symptomsDaysMissedRed?: number;
  symptomsScoreApplicability?: boolean;
  symptomsScoreAmber?: number;
  symptomsScoreRed?: number;
  decompensationScoreApplicability?: boolean;
  decompensationScoreAmber?: number;
  decompensationScoreRed?: number;
  ewsScoreApplicability?: boolean;
  ewsScoreAmber?: number;
  ewsScoreRed?: number;
  respirationRateLowerThanApplicability?: boolean;
  respirationRateLowerThanAmber?: number;
  respirationRateLowerThanRed?: number;
  respirationRateHigherThanApplicability?: boolean;
  respirationRateHigherThanAmber?: number;
  respirationRateHigherThanRed?: number;
  heartRateLowerThanApplicability?: boolean;
  heartRateLowerThanAmber?: number;
  heartRateLowerThanRed?: number;
  heartRateHigherThanApplicability?: boolean;
  heartRateHigherThanAmber?: number;
  heartRateHigherThanRed?: number;
  temperatureApplicability?: boolean;
  temperatureAmber?: number;
  temperatureRed?: number;
  spo2Applicability?: boolean;
  spo2Amber?: number;
  spo2Red?: number;
  activityScoreApplicability?: boolean;
  activityScoreAmber?: number;
  activityScoreRed?: number;
  bloodPressureSystolicLowerThanApplicability?: boolean;
  bloodPressureSystolicLowerThanAmber?: number;
  bloodPressureSystolicLowerThanRed?: number;
  bloodPressureSystolicHigherThanApplicability?: boolean;
  bloodPressureSystolicHigherThanAmber?: number;
  bloodPressureSystolicHigherThanRed?: number;
  bloodPressureDiastolicLowerThanApplicability?: boolean;
  bloodPressureDiastolicLowerThanAmber?: number;
  bloodPressureDiastolicLowerThanRed?: number;
  bloodPressureDiastolicHigherThanApplicability?: boolean;
  bloodPressureDiastolicHigherThanAmber?: number;
  bloodPressureDiastolicHigherThanRed?: number;
}