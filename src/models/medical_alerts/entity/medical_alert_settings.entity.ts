import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Organization } from 'src/models/organization/entity/organization.entity';
import {
  ResolutionType,
  RiskReadingType,
  RiskStratification,
} from './medical_alerts.enum';
import { MedicalAlertNotificationSettings } from './medical_alert_notification_settings.entity';

@Entity('medical_alert_settings')
export class MedicalAlertSettings {
  @PrimaryGeneratedColumn('uuid')
  @Index('medical_alert_settings_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;
  @OneToOne(
    () => Organization,
    (organization: Organization) => organization.medicalAlertSettings,
  )
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    name: 'is_active',
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Column({
    name: 'resolution_type',
    type: 'enum',
    enum: ResolutionType,
    default: ResolutionType.DAILY,
  })
  resolution: ResolutionType;

  @Column({
    name: 'risk_stratification',
    type: 'enum',
    enum: RiskStratification,
    default: RiskStratification.BINARY,
  })
  riskStratification: RiskStratification;

  // Amber risk Level
  @Column({
    name: 'amber_risk_applicability',
    type: Boolean,
    default: false,
  })
  amberRiskApplicability: boolean;

  @Column({
    name: 'amber_risk_reading_type',
    type: 'enum',
    enum: RiskReadingType,
    default: RiskReadingType.CONSECUTIVE,
  })
  amberRiskReadingType: RiskReadingType;

  @Column({ name: 'amber_risk_reading_choice', type: 'integer', default: 1 })
  amberRiskReadingChoice: number;

  @Column({ name: 'amber_risk_reading_out_of', type: 'integer', default: 1 })
  amberRiskReadingOutOf: number;

  @Column({
    name: 'notify_amber_risk',
    type: Boolean,
    default: false,
  })
  notifyAmberRisk: boolean;

  // Red risk level
  @Column({
    name: 'red_risk_applicability',
    type: Boolean,
    default: true,
  })
  redRiskApplicability: boolean;

  @Column({
    name: 'red_risk_reading_type',
    type: 'enum',
    enum: RiskReadingType,
    default: RiskReadingType.CONSECUTIVE,
  })
  redRiskReadingType: RiskReadingType;

  @Column({ name: 'red_risk_reading_choice', type: 'integer', default: 3 })
  redRiskReadingChoice: number;

  @Column({ name: 'red_risk_reading_out_of', type: 'integer', default: 3 })
  redRiskReadingOutOf: number;

  @Column({
    name: 'notify_red_risk',
    type: Boolean,
    default: false,
  })
  notifyRedRisk: boolean;

  // Green risk level
  @Column({
    name: 'green_risk_applicability',
    type: Boolean,
    default: true,
  })
  greenRiskApplicability: boolean;

  @Column({
    name: 'notify_green_risk',
    type: Boolean,
    default: false,
  })
  notifyGreenRisk: boolean;

  @Column({ name: 'consecutive_amber_risk', type: 'integer', default: 3 })
  consecutiveAmberRisk: number;

  @Column({ name: 'reactivation_hours', type: 'smallint', default: 0 })
  reactivationHours: number;

  @Column({ name: 'reactivation_days', type: 'smallint', default: 0 })
  reactivationDays: number;

  @Column({ name: 'scheduler_id', type: 'varchar', nullable: true })
  schedulerId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @OneToMany(
    () => MedicalAlertNotificationSettings,
    (medicalAlertNotificationSettings) =>
      medicalAlertNotificationSettings.medicalAlertSettings,
  )
  medicalAlertNotificationSettings: MedicalAlertNotificationSettings[];
}
