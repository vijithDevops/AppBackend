import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEventMasterModelService } from './notification_event_master.model.service';
import { NotificationEventMaster } from './entity/notification_event_master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEventMaster])],
  providers: [NotificationEventMasterModelService],
  exports: [NotificationEventMasterModelService],
})
export class NotificationEventMasterModelModule {}
