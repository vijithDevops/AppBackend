import { MedicalAlertNotificationSettings } from 'src/models/medical_alerts/entity/medical_alert_notification_settings.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  Unique,
  OneToMany,
} from 'typeorm';
import { NotificationObject } from '../../notification/entity/notification_object.entity';
import { UserNotifications } from '../../notification/entity/user_notifications.view.entity';
import { eventCategory, NotificationType } from './notification_event.enum';

@Entity('notification_event_master')
@Index(['event', 'eventType', 'eventName', 'notificationType'], {
  unique: true,
})
@Unique(['event', 'eventType', 'eventName', 'notificationType'])
export class NotificationEventMaster {
  @PrimaryGeneratedColumn('uuid')
  @Index('notification_event_master_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'event', type: 'varchar', length: 50 })
  event: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType: string;

  @Column({ name: 'event_name', type: 'varchar', length: 50 })
  eventName: string;

  @Column({
    name: 'event_category',
    type: 'enum',
    enum: eventCategory,
    default: eventCategory.NON_MEDICAL,
  })
  eventCategory: eventCategory;

  @Column({ name: 'message_template', type: 'text' })
  messageTemplate: string;

  @Column({ name: 'message_title', type: 'varchar', length: 50 })
  messageTitle: string;

  @Column({
    name: 'message_header',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  messageHeader: string;

  @Column({ name: 'description', type: 'varchar', length: 250 })
  description: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ name: 'acknowledge_required', type: 'boolean', default: 0 })
  acknowledgeRequired: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;

  @OneToMany(
    () => NotificationObject,
    (notification) => notification.notificationEvent,
  )
  notificationObjects: NotificationObject[];

  @OneToMany(
    () => UserNotifications,
    (notifications) => notifications.notificationEvent,
  )
  userNotifications: UserNotifications[];

  @OneToMany(
    () => MedicalAlertNotificationSettings,
    (medicalAlertNotificationSettings) =>
      medicalAlertNotificationSettings.notificationEvent,
  )
  medicalAlertNotificationSettings: MedicalAlertNotificationSettings[];
}
