import {
  ViewEntity,
  ViewColumn,
  Connection,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { NotificationObject } from './notification_object.entity';
import { NotificationNotifier } from './notification_notifier.entity';
import { NotificationEventMaster } from '../../notification_event_master/entity/notification_event_master.entity';
import { User } from '../../user/entity/user.entity';
import { eventCategory } from 'src/models/notification_event_master/entity/notification_event.enum';

@ViewEntity({
  name: 'user_notification_view',
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select([
        'notificationNotifier.id                                AS id',
        'notificationNotifier.notifierId                        AS user_id',
        'notificationNotifier.readAt                            AS read_at',
        'notificationNotifier.isRead                            AS is_read',
        'notificationNotifier.isAcknowledged                    AS is_acknowledged',
        'notificationNotifier.acknowledgeAt                     AS acknowledge_at',
        `CASE  
          WHEN  notificationNotifier.acknowledgeRequired IS NOT NULL
            THEN  notificationNotifier.acknowledgeRequired
            ELSE  notificationEvent.acknowledgeRequired
          END                                                   AS  acknowledge_required`,
        'notificationEvent.event                                AS event',
        'notificationEvent.eventType                            AS event_type',
        'notificationEvent.eventName                            AS event_name',
        'notificationEvent.eventCategory                        AS event_category',
        // 'notificationEvent.acknowledgeRequired                  AS acknowledge_required',
        'notificationObject.id                                  AS notification_object_id',
        'notificationObject.actorId                             AS actor_id',
        'notificationObject.messageContent                      AS message_content',
        'notificationObject.messageTitle                        AS message_title',
        'notificationObject.payload                             AS payload',
        'notificationObject.notificationEventId                 AS notification_event_id',
        'notificationObject.createdAt                           AS created_at',
        'notificationObject.updatedAt                           AS updated_at',
        'notificationNotifier.deletedAt                         AS deleted_at',
      ])
      .from(NotificationNotifier, 'notificationNotifier')
      .leftJoin(
        NotificationObject,
        'notificationObject',
        'notificationObject.id = notificationNotifier.notificationObjectId',
      )
      .leftJoin(
        NotificationEventMaster,
        'notificationEvent',
        'notificationEvent.id = notificationObject.notificationEventId',
      ),
})
export class UserNotifications {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.userNotificationUser)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ViewColumn({ name: 'notification_object_id' })
  notificationObjectId: string;

  @ViewColumn({ name: 'event' })
  event: string;

  @ViewColumn({ name: 'event_type' })
  eventType: string;

  @ViewColumn({ name: 'event_name' })
  eventName: string;

  @ViewColumn({ name: 'event_category' })
  eventCategory: eventCategory;

  @ViewColumn({ name: 'acknowledge_required' })
  acknowledgeRequired: boolean;

  @ViewColumn({ name: 'actor_id' })
  actorId: string;
  @ManyToOne(() => User, (user) => user.userNotificationActor)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @ViewColumn({ name: 'message_content' })
  messageContent: string;

  @ViewColumn({ name: 'message_title' })
  messageTitle: string;

  @ViewColumn({ name: 'payload' })
  payload: any;

  @ViewColumn({ name: 'is_read' })
  isRead: boolean;

  @ViewColumn({ name: 'is_acknowledged' })
  isAcknowledged: boolean;

  @ViewColumn({ name: 'read_at' })
  readAt: Date;

  @ViewColumn({ name: 'acknowledge_at' })
  acknowledgeAt: Date;

  @ViewColumn({ name: 'notification_event_id' })
  notificationEventId: string;
  @ManyToOne(
    () => NotificationEventMaster,
    (notificationEventMaster) => notificationEventMaster.userNotifications,
  )
  @JoinColumn({ name: 'notification_event_id' })
  notificationEvent: NotificationEventMaster;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ViewColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
