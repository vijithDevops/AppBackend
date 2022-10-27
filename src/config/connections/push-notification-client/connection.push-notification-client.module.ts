import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseConnection } from './connection.push-notification-client.provider';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseConnection],
  exports: [FirebaseConnection],
})
export class PushNotificationConnectionModule {}
