import { OrganizationQuestionnaireMapping } from '../../symptoms-questionnaire/entity/organization_questionnaire_mapping.entity';
// import { SymptomsQuestionnnaire } from './../../symptoms-questionnaire/entity/symptoms_questionnaire.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Address, Contact } from '../types';
import { User } from '../../user/entity/user.entity';
import { OrganizationType } from './organization.enum';
import { Appointment } from 'src/models/appointment/entity/appointment.entity';
import { Gateway } from 'src/models/gateway/entity/gateway.entity';
import { Sensor } from 'src/models/sensor/entity/sensor.entity';
import { File } from '../../file/entity/file.entity';
import { OrganizationVitalSigns } from 'src/models/vital_signs/entity/organization_vital_signs.entity';
import { MedicalAlertSettings } from 'src/models/medical_alerts/entity/medical_alert_settings.entity';
import { NonMedicalNotification } from 'src/models/non_medical_notification/entity/non_medical_notification.entity';
import { OrganizationSettings } from 'src/models/organization-settings/entity/organization-settings.entity';
import { OrganizationSymptomsQuestionnaires } from 'src/models/symptoms-questionnaire/entity/organization_questionnaires.view.entity';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'varchar',
    name: 'phone_number',
    length: 20,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({ name: 'primary_contact', type: 'jsonb' })
  primaryContact: Contact;

  @Column({ name: 'secondary_contact', type: 'jsonb', nullable: true })
  secondaryContact: Contact;

  @Column({ type: 'jsonb', nullable: true })
  address: Address;

  @Column({
    name: 'timezone',
    type: 'varchar',
    nullable: true,
  })
  timezone: string;

  @Column({ type: 'varchar', length: 15, default: OrganizationType.HOSPITAL })
  type: OrganizationType;

  @Column({
    name: 'cache_update_scheduler_id',
    type: 'varchar',
    nullable: true,
  })
  cacheUpdateSchedulerId?: string;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true, type: 'varchar', length: 254 })
  deletedBy?: string;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Appointment, (appointment) => appointment.organization)
  appointments: Appointment[];

  @OneToMany(() => Gateway, (gateway) => gateway.organization)
  gateways: Gateway[];

  @OneToMany(() => Sensor, (sensor) => sensor.organization)
  sensors: Sensor[];

  // @OneToMany(() => MessageGroup, (messageGroup) => messageGroup.organization)
  // messageGroups: MessageGroup[];

  @OneToMany(() => File, (file) => file.organization)
  files: File[];

  @OneToOne(
    () => MedicalAlertSettings,
    (medicalAlertSettings) => medicalAlertSettings.organization,
  )
  medicalAlertSettings: MedicalAlertSettings;

  @OneToOne(
    () => OrganizationSettings,
    (organizationSettings) => organizationSettings.organization,
  )
  organizationSettings: OrganizationSettings;

  @OneToMany(
    () => OrganizationVitalSigns,
    (organizationVitalSigns) => organizationVitalSigns.organization,
  )
  organizationVitalSigns: OrganizationVitalSigns[];

  @OneToMany(
    () => NonMedicalNotification,
    (nonMedicalNotification) => nonMedicalNotification.organization,
  )
  nonMedicalNotifications: NonMedicalNotification[];

  @OneToMany(
    () => OrganizationQuestionnaireMapping,
    (organizationQuestionnaireMapping) =>
      organizationQuestionnaireMapping.organization,
  )
  organizationQuestionnaireMapping: OrganizationQuestionnaireMapping[];

  @OneToMany(
    () => OrganizationSymptomsQuestionnaires,
    (organizationSymptomsQuestionnaires) =>
      organizationSymptomsQuestionnaires.organization,
  )
  symptomsQuestionnaires: OrganizationSymptomsQuestionnaires[];
}
