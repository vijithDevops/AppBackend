import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationReminder } from './notification_reminder.entity';

@Entity('notification_reminder_time')
export class NotificationReminderTime {
  @PrimaryGeneratedColumn('uuid')
  @Index('notification_reminder_time_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'notification_reminder_id' })
  notificationReminderId: string;
  @ManyToOne(
    () => NotificationReminder,
    (notificationReminder) => notificationReminder.reminderTimes,
  )
  @JoinColumn({ name: 'notification_reminder_id' })
  notificationReminder: NotificationReminder;

  @Column({ name: 'hour', type: 'smallint' })
  hour: number;

  @Column({ name: 'minute', type: 'smallint' })
  minute: number;

  @Column({ name: 'is_utc', type: 'boolean', default: 1 })
  isUTC: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: 0 })
  isDefault: boolean;

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
}
