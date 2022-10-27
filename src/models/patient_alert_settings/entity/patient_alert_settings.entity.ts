import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity()
export class PatientAlertSettings {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_alert_settings_id_uidx', { unique: true })
  id: string;

  //
  @Column({
    name: 'patient_note_applicability',
    type: Boolean,
    default: false,
  })
  patientNoteApplicability: boolean;

  //
  @Column({
    name: 'compliance_score_applicability',
    type: Boolean,
    default: false,
  })
  complianceScoreApplicability: boolean;

  @Column({ name: 'compliance_score_amber', type: 'integer', default: 70 })
  complianceScoreAmber: number;

  @Column({ name: 'compliance_score_red', type: 'integer', default: 50 })
  complianceScoreRed: number;

  //
  @Column({
    name: 'medication_days_missed_applicability',
    type: Boolean,
    default: false,
  })
  medicationDaysMissedApplicability: boolean;

  @Column({ name: 'medication_days_missed_amber', type: 'integer', default: 1 })
  medicationDaysMissedAmber: number;

  @Column({ name: 'medication_days_missed_red', type: 'integer', default: 3 })
  medicationDaysMissedRed: number;

  //
  @Column({
    name: 'sensor_days_missed_applicability',
    type: Boolean,
    default: false,
  })
  sensorDaysMissedApplicability: boolean;

  @Column({ name: 'sensor_days_missed_amber', type: 'integer', default: 1 })
  sensorDaysMissedAmber: number;

  @Column({ name: 'sensor_days_missed_red', type: 'integer', default: 3 })
  sensorDaysMissedRed: number;

  //
  @Column({
    name: 'breathing_exercise_days_missed_applicability',
    type: Boolean,
    default: false,
  })
  breathingExerciseDaysMissedApplicability: boolean;

  @Column({
    name: 'breathing_exercise_days_missed_amber',
    type: 'integer',
    default: 1,
  })
  breathingExerciseDaysMissedAmber: number;

  @Column({
    name: 'breathing_exercise_days_missed_red',
    type: 'integer',
    default: 3,
  })
  breathingExerciseDaysMissedRed: number;

  //
  @Column({
    name: 'health_inputs_days_missed_applicability',
    type: Boolean,
    default: false,
  })
  healthInputsDaysMissedApplicability: boolean;

  @Column({
    name: 'health_inputs_days_missed_amber',
    type: 'integer',
    default: 1,
  })
  healthInputsDaysMissedAmber: number;

  @Column({
    name: 'health_inputs_days_missed_red',
    type: 'integer',
    default: 3,
  })
  healthInputsDaysMissedRed: number;

  //
  @Column({
    name: 'symptoms_days_missed_applicability',
    type: Boolean,
    default: false,
  })
  symptomsDaysMissedApplicability: boolean;

  @Column({ name: 'symptoms_days_missed_amber', type: 'integer', default: 1 })
  symptomsDaysMissedAmber: number;

  @Column({ name: 'symptoms_days_missed_red', type: 'integer', default: 3 })
  symptomsDaysMissedRed: number;

  //
  @Column({
    name: 'symptoms_score_applicability',
    type: Boolean,
    default: false,
  })
  symptomsScoreApplicability: boolean;

  @Column({ name: 'symptoms_score_amber', type: 'integer', default: 5 })
  symptomsScoreAmber: number;

  @Column({ name: 'symptoms_score_red', type: 'integer', default: 10 })
  symptomsScoreRed: number;

  //
  @Column({
    name: 'decompensation_score_applicability',
    type: Boolean,
    default: false,
  })
  decompensationScoreApplicability: boolean;

  @Column({ name: 'decompensation_score_amber', type: 'integer', default: 60 })
  decompensationScoreAmber: number;

  @Column({ name: 'decompensation_score_red', type: 'integer', default: 80 })
  decompensationScoreRed: number;

  //
  @Column({
    name: 'ews_score_applicability',
    type: Boolean,
    default: false,
  })
  ewsScoreApplicability: boolean;

  @Column({ name: 'ews_score_amber', type: 'integer', default: 5 })
  ewsScoreAmber: number;

  @Column({ name: 'ews_score_red', type: 'integer', default: 7 })
  ewsScoreRed: number;

  //
  @Column({
    name: 'respiration_rate_lower_than_applicability',
    type: Boolean,
    default: false,
  })
  respirationRateLowerThanApplicability: boolean;

  @Column({
    name: 'respiration_rate_lower_than_amber',
    type: 'integer',
    default: 10,
  })
  respirationRateLowerThanAmber: number;

  @Column({
    name: 'respiration_rate_lower_than_red',
    type: 'integer',
    default: 8,
  })
  respirationRateLowerThanRed: number;

  //
  @Column({
    name: 'respiration_rate_higher_than_applicability',
    type: Boolean,
    default: false,
  })
  respirationRateHigherThanApplicability: boolean;

  @Column({
    name: 'respiration_rate_higher_than_amber',
    type: 'integer',
    default: 25,
  })
  respirationRateHigherThanAmber: number;

  @Column({
    name: 'respiration_rate_higher_than_red',
    type: 'integer',
    default: 30,
  })
  respirationRateHigherThanRed: number;

  //
  @Column({
    name: 'heart_rate_lower_than_applicability',
    type: Boolean,
    default: false,
  })
  heartRateLowerThanApplicability: boolean;

  @Column({
    name: 'heart_rate_lower_than_amber',
    type: 'integer',
    default: 50,
  })
  heartRateLowerThanAmber: number;

  @Column({
    name: 'heart_rate_lower_than_red',
    type: 'integer',
    default: 40,
  })
  heartRateLowerThanRed: number;

  //
  @Column({
    name: 'heart_rate_higher_than_applicability',
    type: Boolean,
    default: false,
  })
  heartRateHigherThanApplicability: boolean;

  @Column({
    name: 'heart_rate_higher_than_amber',
    type: 'integer',
    default: 90,
  })
  heartRateHigherThanAmber: number;

  @Column({
    name: 'heart_rate_higher_than_red',
    type: 'integer',
    default: 100,
  })
  heartRateHigherThanRed: number;

  //
  @Column({
    name: 'temperature_applicability',
    type: Boolean,
    default: false,
  })
  temperatureApplicability: boolean;

  @Column({
    name: 'temperature_amber',
    type: 'real',
    default: 37.5,
  })
  temperatureAmber: number;

  @Column({
    name: 'temperature_red',
    type: 'real',
    default: 38,
  })
  temperatureRed: number;

  //
  @Column({
    name: 'spo2_applicability',
    type: Boolean,
    default: false,
  })
  spo2Applicability: boolean;

  @Column({
    name: 'spo2_amber',
    type: 'integer',
    default: 94,
  })
  spo2Amber: number;

  @Column({
    name: 'spo2_red',
    type: 'integer',
    default: 91,
  })
  spo2Red: number;

  //
  @Column({
    name: 'activity_score_applicability',
    type: Boolean,
    default: false,
  })
  activityScoreApplicability: boolean;

  @Column({
    name: 'activity_score_amber',
    type: 'integer',
    default: 5,
  })
  activityScoreAmber: number;

  @Column({
    name: 'activity_score_red',
    type: 'integer',
    default: 10,
  })
  activityScoreRed: number;

  //
  @Column({
    name: 'blood_pressure_systolic_lower_than_applicability',
    type: Boolean,
    default: false,
  })
  bloodPressureSystolicLowerThanApplicability: boolean;

  @Column({
    name: 'blood_pressure_systolic_lower_than_amber',
    type: 'integer',
    default: 100,
  })
  bloodPressureSystolicLowerThanAmber: number;

  @Column({
    name: 'blood_pressure_systolic_lower_than_red',
    type: 'integer',
    default: 90,
  })
  bloodPressureSystolicLowerThanRed: number;

  //
  @Column({
    name: 'blood_pressure_systolic_higher_than_applicability',
    type: Boolean,
    default: false,
  })
  bloodPressureSystolicHigherThanApplicability: boolean;

  @Column({
    name: 'blood_pressure_systolic_higher_than_amber',
    type: 'integer',
    default: 100,
  })
  bloodPressureSystolicHigherThanAmber: number;

  @Column({
    name: 'blood_pressure_systolic_higher_than_red',
    type: 'integer',
    default: 200,
  })
  bloodPressureSystolicHigherThanRed: number;

  //
  @Column({
    name: 'blood_pressure_diastolic_lower_than_applicability',
    type: Boolean,
    default: false,
  })
  bloodPressureDiastolicLowerThanApplicability: boolean;

  @Column({
    name: 'blood_pressure_diastolic_lower_than_amber',
    type: 'integer',
    default: 65,
  })
  bloodPressureDiastolicLowerThanAmber: number;

  @Column({
    name: 'blood_pressure_diastolic_lower_than_red',
    type: 'integer',
    default: 60,
  })
  bloodPressureDiastolicLowerThanRed: number;

  //
  @Column({
    name: 'blood_pressure_diastolic_higher_than_applicability',
    type: Boolean,
    default: false,
  })
  bloodPressureDiastolicHigherThanApplicability: boolean;

  @Column({
    name: 'blood_pressure_diastolic_higher_than_amber',
    type: 'integer',
    default: 100,
  })
  bloodPressureDiastolicHigherThanAmber: number;

  @Column({
    name: 'blood_pressure_diastolic_higher_than_red',
    type: 'integer',
    default: 120,
  })
  bloodPressureDiastolicHigherThanRed: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true, type: 'varchar', length: 254 })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar', length: 254 })
  updatedBy?: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @OneToOne(() => User, (user) => user.patientAlertSettings)
  @JoinColumn({ name: 'patient_id' })
  patient: User;
}
