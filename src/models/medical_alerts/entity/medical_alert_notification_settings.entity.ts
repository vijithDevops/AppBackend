import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MedicalAlertSettings } from './medical_alert_settings.entity';
import { NotificationEventMaster } from 'src/models/notification_event_master/entity/notification_event_master.entity';

@Entity('medical_alert_notification_settings')
@Unique(['medicalAlertSettingsId', 'notificationEventId'])
export class MedicalAlertNotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  @Index('medical_alert_notification_settings_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'medical_alert_settings_id' })
  medicalAlertSettingsId: string;
  @ManyToOne(
    () => MedicalAlertSettings,
    (medicalAlertSettings) =>
      medicalAlertSettings.medicalAlertNotificationSettings,
  )
  @JoinColumn({ name: 'medical_alert_settings_id' })
  medicalAlertSettings: MedicalAlertSettings;

  @Column({ name: 'notification_event_id' })
  notificationEventId: string;
  @ManyToOne(
    () => NotificationEventMaster,
    (notificationEventMaster) =>
      notificationEventMaster.medicalAlertNotificationSettings,
  )
  @JoinColumn({ name: 'notification_event_id' })
  notificationEvent: NotificationEventMaster;

  @Column({ name: 'message_template', type: 'text' })
  messageTemplate: string;

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
}
