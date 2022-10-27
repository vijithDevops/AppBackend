import { Module } from '@nestjs/common';
import { DatabaseConnectionModule } from './database/connection.database.module';
import { SMSConnectionModule } from './sms-client/connection.sms-client.module';
import { MicroservicesConnectionModule } from './microservices/connection.microservices.module';
import { PushNotificationModule } from '../../services/push-notification/push-notification.module';
import { FileUploadClientConnectionModule } from './file-upload-client/connection.file-upload-client.module';
import { EmailConnectionModule } from './email-client/connection.email-client.modul';

@Module({
  imports: [
    DatabaseConnectionModule,
    FileUploadClientConnectionModule,
    SMSConnectionModule,
    PushNotificationModule,
    MicroservicesConnectionModule,
    EmailConnectionModule,
  ],
})
export class ConnectionModule {}
