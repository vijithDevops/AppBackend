import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModelService } from './message.model.service';
import { MessageGroup } from './entity/message_group.entity';
import { MessageGroupUsers } from './entity/message_group_users.entity';
import { MessageGroupSecret } from './entity/message_group_secret.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageGroup,
      MessageGroupUsers,
      MessageGroupSecret,
    ]),
  ],
  providers: [MessageModelService],
  exports: [MessageModelService],
})
export class MessageModelModule {}
