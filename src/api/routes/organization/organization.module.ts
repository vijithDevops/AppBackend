import { EventSchedulerModule } from 'src/services/event-scheduler/event-scheduler.module';
import { NotificationReminderModule } from './../notification-reminder/notification-reminder.module';
import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';
import { OrganizationSettingsModelModule } from 'src/models/organization-settings/organization-settings.model.module';

@Module({
  imports: [
    OrganizationModelModule,
    OrganizationSettingsModelModule,
    NotificationReminderModule,
    EventSchedulerModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
