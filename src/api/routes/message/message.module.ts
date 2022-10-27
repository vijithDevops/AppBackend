import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ChatModule } from '../../../services/chat/chat.module';
import { UserModule } from '../user/user.module';
import { MessageModelModule } from '../../../models/message/message.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { NotificationServiceModule } from '../../../services/notification/notification.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';

@Module({
  imports: [
    MessageModelModule,
    UserModelModule,
    ChatModule,
    UserModule,
    NotificationServiceModule,
    OrganizationModelModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
