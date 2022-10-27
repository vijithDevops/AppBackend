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
  OneToMany,
} from 'typeorm';
import { NotificationEventMaster } from '../../notification_event_master/entity/notification_event_master.entity';
import { User } from '../../user/entity/user.entity';
import { NotificationNotifier } from './notification_notifier.entity';

@Entity('notification_object')
export class NotificationObject {
  @PrimaryGeneratedColumn('uuid')
  @Index('notification_object_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'actor_id' })
  actorId: string;
  @ManyToOne(() => User, (user) => user.actorNotifications)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @Column({ name: 'message_title', type: 'varchar', length: 50 })
  messageTitle: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ name: 'notification_event_id' })
  notificationEventId: string;
  @ManyToOne(
    () => NotificationEventMaster,
    (eventMaster) => eventMaster.notificationObjects,
  )
  @JoinColumn({ name: 'notification_event_id' })
  notificationEvent: NotificationEventMaster;

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
    () => NotificationNotifier,
    (notification) => notification.notificationObject,
  )
  notifiers: NotificationNotifier[];
}
