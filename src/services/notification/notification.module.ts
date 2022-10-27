import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { NotificationModelModule } from '../../models/notification/notification.model.module';
import { NotificationEventMasterModelModule } from '../../models/notification_event_master/notification_event_master.model.module';
import { UserAppDeviceModelModule } from '../../models/user_app_device/user_app_device.model.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NotificationModelModule,
    NotificationEventMasterModelModule,
    UserAppDeviceModelModule,
    PushNotificationModule,
    ConfigModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationServiceModule {}
