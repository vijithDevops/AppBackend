import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotificationController } from './user-notification.controller';
import { NotificationModelModule } from '../../../models/notification/notification.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { NotificationEventMasterModelModule } from '../../../models/notification_event_master/notification_event_master.model.module';
import { NotificationServiceModule } from 'src/services/notification/notification.module';

@Module({
  imports: [
    NotificationModelModule,
    UserModelModule,
    NotificationEventMasterModelModule,
    NotificationServiceModule,
  ],
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
  exports: [UserNotificationService],
})
export class UserNotificationModule {}
