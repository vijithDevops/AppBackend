import { ConfigModule } from '@nestjs/config';
import { DataProcessingServerModule } from './../../../services/data-processing-server/data-processing-server.module';
import { UserModelModule } from './../../../models/user/user.model.module';
import { OrganizationModelModule } from 'src/models/organization/organization.model.module';
import { Module } from '@nestjs/common';
import { EventNotificationService } from './event-notification.service';
import { EventNotificationController } from './event-notification.controller';
import { NotificationServiceModule } from '../../../services/notification/notification.module';
import { AppointmentModelModule } from '../../../models/appointment/appointment.model.module';
import { NotificationReminderModelModule } from '../../../models/notification_reminder/notification_reminder.model.module';
import { EventSchedulerModule } from 'src/services/event-scheduler/event-scheduler.module';
import { MedicalAlertsModule } from '../medical-alerts/medical-alerts.module';
import { NotificationReminderModule } from '../notification-reminder/notification-reminder.module';
import { EmailModule } from 'src/services/email/email.module';

@Module({
  imports: [
    NotificationReminderModelModule,
    AppointmentModelModule,
    NotificationServiceModule,
    EventSchedulerModule,
    MedicalAlertsModule,
    OrganizationModelModule,
    NotificationReminderModule,
    UserModelModule,
    EmailModule,
    ConfigModule,
    DataProcessingServerModule,
  ],
  controllers: [EventNotificationController],
  providers: [EventNotificationService],
})
export class EventNotificationModule {}
