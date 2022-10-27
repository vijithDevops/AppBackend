import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationConnectionModule } from '../../config/connections/push-notification-client/connection.push-notification-client.module';

@Module({
  imports: [PushNotificationConnectionModule],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
