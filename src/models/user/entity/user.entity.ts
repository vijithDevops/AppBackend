import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Gender, Role } from './user.enum';
import { Address } from '../types';
import { PatientInfo } from '../../patient_info/entity/patient_info.entity';
import { MedicationPrescription } from '../../medication_prescription/entity/medication_prescription.entity';
import { PatientMedicationInput } from '../../patient_medication_input/entity/patient_medication_input.entity';
import { PatientBreathingInput } from '../../patient_breathing_input/entity/patient_breathing_input.entity';
import { PatientHealthInputs } from '../../patient_health_inputs/entity/patient_health_inputs.entity';
import { PatientSymptomsInput } from '../../patient_symptoms_input/entity/patient_symptoms_input.entity';
import { ClinicianNote } from '../../clinician_note/entity/clinician_note.entity';
import { PatientNote } from '../../patient_note/entity/patient_note.entity';
import { PatientAlertSettings } from '../../patient_alert_settings/entity/patient_alert_settings.entity';
import { DoctorInfo } from '../../doctor_info/entity/doctor_info.entity';
import { CaretakerInfo } from '../../caretaker_info/entity/caretaker_info.entity';
import { PatientSupervisionMapping } from '../../patient_supervision_mapping/entity/patient_supervision_mapping.entity';
import { Appointment } from '../../appointment/entity/appointment.entity';
import { AppointmentUsers } from '../../appointment/entity/appointment_users.entity';
import { MessageGroupUsers } from '../../message/entity/message_group_users.entity';
import { PasswordChangeRequest } from '../../password_change_request/entity/password_change_request.entity';
import { File } from '../../file/entity/file.entity';
import { NotificationObject } from '../../notification/entity/notification_object.entity';
import { NotificationNotifier } from '../../notification/entity/notification_notifier.entity';
import { UserAppDevice } from '../../user_app_device/entity/user_app_device.entity';
import { BreatingExercisePrescription } from '../../breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';
import { UserNotifications } from '../../notification/entity/user_notifications.view.entity';
import { NotificationReminder } from '../../notification_reminder/entity/notification_reminder.entity';
import { PatientRecord } from '../../patient_records/entity/patient_record.entity';
import { Organization } from '../../organization/entity/organization.entity';
import {
  TrendsSettings,
  UserTrendsSettings,
} from '../../trends_settings/entity/trends_settings.entity';
import { UserAppointments } from 'src/models/appointment/entity/user_appointment.view.entity';
import { PatientVitalSigns } from 'src/models/vital_signs/entity/patient_vital_signs.entity';
import { PatientVitalSignsView } from 'src/models/vital_signs/entity/patient_vital_signs.view.entity';
import { PatientVitalRisk } from 'src/models/medical_alerts/entity/patient_vital_risk.entity';
import { PatientMedicalRisk } from 'src/models/medical_alerts/entity/patient_medical_risk.entity';
import { PatientReminders } from 'src/models/notification_reminder/entity/patient_reminders.view.entity';
import { PatientMedicalRiskHistory } from 'src/models/patient_medical_risk_history/entity/patient_medical_risk_history.entity';
import { PatientQuestionnaireInputs } from 'src/models/patient_questionnaire_input/entity/patient_questionnaire_inputs.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Index('user_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'varchar', length: 35, unique: true })
  @Index('username_uidx', { unique: true })
  username: string;

  @Column({ name: 'first_name', type: 'varchar', length: 35, nullable: true })
  firstName?: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 35, nullable: true })
  middleName?: string;

  @Column({ type: 'varchar', length: 35, name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 128, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({
    type: 'varchar',
    name: 'phone_number',
    length: 20,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'jsonb', nullable: true })
  address?: Address;

  @Column({ name: 'profile_pic', type: 'varchar', nullable: true })
  profilePic?: string;

  @Column({ name: 'profile_pic_thumbnail', type: 'varchar', nullable: true })
  profilePicThumbnail?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'is_on_watchlist', type: 'boolean', default: false })
  isOnWatchlist: boolean;

  @Column({
    name: 'watchlisted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  watchlistedAt?: Date;

  @Column({
    name: 'account_reset_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  accountResetToken?: string;

  @Column({
    name: 'email_verification_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  emailVerificationToken?: string;

  @Column({
    name: 'temperory_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  temperoryToken?: string;

  @Column({
    name: 'blocked_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  blockedAt?: Date;

  @Column({ name: 'login_failed_count', type: 'integer', default: 0 })
  loginFailedCount: number;

  @Column({ name: 'is_email_verified', type: 'boolean', default: 0 })
  isEmailVerified: boolean;

  @Column({ name: 'is_clinical_trial_user', type: 'boolean', default: 0 })
  isClinicalTrialUser: boolean;

  @Column({ name: 'is_client_patient', type: 'boolean', default: 0 })
  isClientPatient: boolean;

  @Column({ name: 'is_t_and_c_accepted', type: 'boolean', default: 0 })
  isTAndCAccepted: boolean;

  @Column({ name: 'is_phone_number_verified', type: 'boolean', default: 0 })
  isPhoneNumberVerified: boolean;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({
    name: 'chat_id',
    type: 'integer',
    nullable: true,
  })
  chatId?: number;

  unacknowledgedNotifications?: number;
  upcomingAppointmentsCount?: number;
  patientNotesCount?: number;
  latestPatientNote?: PatientNote;
  upcommingAppointment?: Appointment;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @Column({
    name: 'created_by',
    nullable: true,
    type: 'varchar',
    length: 254,
  })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @Column({
    name: 'deleted_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  deletedBy?: string;

  // include the relation when there is multiple hospitals
  @Column({ name: 'organization_id' })
  organizationId: string;
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.users,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  //TODO: changes for role and role mapping
  // user and role relation using role_mapping table
  // @ManyToMany(() => Role, (role) => role.users, {
  // cascade: true,
  // })
  // @JoinTable({
  // name: 'role_mapping', // table name for the junction table of this relation
  // joinColumn: {
  // name: 'user_id',
  // },
  // inverseJoinColumn: {
  // name: 'role_id',
  // },
  // })
  // roles: Role[];

  // Patient fileds / Pateint Info
  @OneToOne(() => PatientInfo, (patientInfo) => patientInfo.patient)
  patientInfo: PatientInfo;

  // Doctor fields / doctor Info
  @OneToOne(() => DoctorInfo, (doctorInfo) => doctorInfo.doctor)
  doctorInfo: DoctorInfo;

  @OneToMany(
    () => NotificationNotifier,
    (notification) => notification.notifier,
  )
  userNotifications: NotificationNotifier[];

  @OneToMany(() => UserNotifications, (notification) => notification.actor)
  userNotificationActor: UserNotifications[];

  @OneToMany(() => UserNotifications, (notification) => notification.user)
  userNotificationUser: UserNotifications[];

  @OneToMany(
    () => NotificationObject,
    (notificationObject) => notificationObject.actor,
  )
  actorNotifications: NotificationObject[];

  @OneToMany(
    () => MedicationPrescription,
    (prescription) => prescription.patient,
  )
  medicationPrescriptions: MedicationPrescription[];

  @OneToMany(
    () => BreatingExercisePrescription,
    (prescription) => prescription.patient,
  )
  breathingExercisePrescriptions: BreatingExercisePrescription[];

  @OneToMany(() => PatientMedicationInput, (input) => input.patient)
  patientMedicationInputs: PatientMedicationInput[];

  @OneToMany(() => PatientBreathingInput, (input) => input.patient)
  patientBreathingInputs: PatientBreathingInput[];

  @OneToMany(() => PatientHealthInputs, (input) => input.patient)
  patientHealthInputs: PatientHealthInputs[];

  @OneToMany(() => PatientSymptomsInput, (input) => input.patient)
  patientSymptomsInput: PatientSymptomsInput[];

  @OneToMany(() => ClinicianNote, (note) => note.patient)
  clinicianNotesPatient: ClinicianNote[];

  @OneToMany(() => PatientNote, (note) => note.patient)
  patientNotesPatient: PatientNote[];

  @OneToOne(() => PatientAlertSettings, (alertSetting) => alertSetting.patient)
  patientAlertSettings: PatientAlertSettings;

  // One to many relationship with users
  // patient caretakers
  @OneToMany(() => CaretakerInfo, (caretakerInfo) => caretakerInfo.patient)
  patientCaretakers: CaretakerInfo[];

  // One to many relationship with users
  // patient of a caretaker
  @OneToOne(() => CaretakerInfo, (caretakerInfo) => caretakerInfo.caretaker)
  caretakersPatient: CaretakerInfo;

  @OneToMany(() => ClinicianNote, (note) => note.doctor)
  clinicianNotesDoctor: ClinicianNote[];

  @OneToMany(() => PatientNote, (note) => note.doctor)
  patientNotesDoctor: PatientNote[];

  // patient supervisors
  @OneToMany(
    () => PatientSupervisionMapping,
    (patientSupervisionMapping) => patientSupervisionMapping.patient,
  )
  patientSupervisors: PatientSupervisionMapping[];

  // doctors/nurse assigned patients
  @OneToMany(
    () => PatientSupervisionMapping,
    (patientSupervisionMapping) => patientSupervisionMapping.user,
  )
  assignedPatients: PatientSupervisionMapping[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => AppointmentUsers, (appointmentUser) => appointmentUser.user)
  userAppointments: AppointmentUsers[];

  @OneToMany(
    () => UserAppointments,
    (userAppointments) => userAppointments.patient,
  )
  userAppointmentsPatient: UserAppointments[];

  @OneToMany(
    () => UserAppointments,
    (userAppointments) => userAppointments.doctor,
  )
  userAppointmentsDoctor: UserAppointments[];

  @OneToMany(
    () => MessageGroupUsers,
    (messageGroupUsers) => messageGroupUsers.user,
  )
  userMessageGroups: MessageGroupUsers[];

  @OneToOne(
    () => PasswordChangeRequest,
    (passwordChange) => passwordChange.user,
  )
  passwordChangeRequest: PasswordChangeRequest;

  @OneToOne(
    () => PatientMedicalRisk,
    (patientMedicalRisk) => patientMedicalRisk.patient,
  )
  patientMedicalRisk: PatientMedicalRisk;

  @OneToMany(
    () => PatientMedicalRisk,
    (patientMedicalRisk) => patientMedicalRisk.lastAcknowledgedUser,
  )
  medicalRiskAcknowledgements: PatientMedicalRisk[];

  @OneToMany(() => File, (file) => file.user)
  files: File[];

  @OneToMany(() => UserAppDevice, (userAppDevice) => userAppDevice.user)
  userDevices: UserAppDevice[];

  @OneToMany(
    () => NotificationReminder,
    (notificationReminder) => notificationReminder.patient,
  )
  patientNotificationReminders: NotificationReminder[];

  @OneToMany(() => PatientRecord, (patientRecord) => patientRecord.patient)
  patientRecords: PatientRecord[];

  @OneToMany(() => TrendsSettings, (trendsSettings) => trendsSettings.user)
  trendsSettings: TrendsSettings[];

  @OneToMany(
    () => UserTrendsSettings,
    (userTrendsSettings) => userTrendsSettings.user,
  )
  userTrendsSettings: UserTrendsSettings[];

  @OneToMany(
    () => PatientVitalSigns,
    (patientVitalSigns) => patientVitalSigns.patient,
  )
  patientVitalSigns: PatientVitalSigns[];

  @OneToMany(
    () => PatientVitalSignsView,
    (patientVitalSignsView) => patientVitalSignsView.patient,
  )
  vitalSignsSettings: PatientVitalSignsView[];

  @OneToMany(
    () => PatientVitalRisk,
    (patientVitalRisk) => patientVitalRisk.patient,
  )
  patientVitalRisks: PatientVitalRisk[];

  @OneToMany(
    () => PatientReminders,
    (patientReminders) => patientReminders.patient,
  )
  patientRemindersView: PatientReminders[];

  @OneToMany(
    () => PatientMedicalRiskHistory,
    (patientMedicalRiskHistory) => patientMedicalRiskHistory.patient,
  )
  patientMedicalRiskHistory: PatientMedicalRiskHistory[];

  @OneToMany(
    () => PatientMedicalRiskHistory,
    (patientMedicalRiskHistory) => patientMedicalRiskHistory.patient,
  )
  patientQuestionnaireInput: PatientQuestionnaireInputs[];
}
