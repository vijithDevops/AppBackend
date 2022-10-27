import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModelService } from './notification.model.service';
import { NotificationNotifier } from './entity/notification_notifier.entity';
import { NotificationObject } from './entity/notification_object.entity';
import { UserNotifications } from './entity/user_notifications.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationNotifier,
      NotificationObject,
      UserNotifications,
    ]),
  ],
  providers: [NotificationModelService],
  exports: [NotificationModelService],
})
export class NotificationModelModule {}
