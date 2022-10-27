import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { VideoCallModule } from '../../../services/video-call/video-call.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationServiceModule } from '../../../services/notification/notification.module';
import { EventSchedulerModule } from 'src/services/event-scheduler/event-scheduler.module';
import { AppointmentModelModule } from '../../../models/appointment/appointment.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { EmailModule } from '../../../services/email/email.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';

@Module({
  imports: [
    AppointmentModelModule,
    CalendarModelModule,
    VideoCallModule,
    ConfigModule,
    NotificationServiceModule,
    EventSchedulerModule,
    EmailModule,
    UserModelModule,
    OrganizationModelModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
