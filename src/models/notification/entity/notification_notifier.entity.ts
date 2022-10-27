import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { NotificationObject } from './notification_object.entity';

@Entity('notification_notifier')
export class NotificationNotifier {
  @PrimaryGeneratedColumn('uuid')
  @Index('notification_notifier_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'notifier_id' })
  notifierId: string;
  @ManyToOne(() => User, (user) => user.userNotifications)
  @JoinColumn({ name: 'notifier_id' })
  notifier: User;

  @Column({ name: 'notification_object_id' })
  notificationObjectId: string;
  @ManyToOne(
    () => NotificationObject,
    (notificationObject) => notificationObject.notifiers,
  )
  @JoinColumn({ name: 'notification_object_id' })
  notificationObject: NotificationObject;

  @Column({ name: 'is_read', type: 'boolean', default: 0 })
  isRead: boolean;

  @Column({ name: 'acknowledge_required', type: 'boolean', nullable: true })
  acknowledgeRequired?: boolean;

  @Column({ name: 'is_acknowledged', type: 'boolean', default: 0 })
  isAcknowledged: boolean;

  @Column({
    name: 'read_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  readAt?: Date;

  @Column({
    name: 'acknowledge_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  acknowledgeAt?: Date;

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
}
