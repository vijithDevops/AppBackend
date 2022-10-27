import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { PatientAlertModule } from '../patient-alerts/patient-alert.module';
import { PatientAlertSettingsModelModule } from '../../models/patient_alert_settings/patient_alert_settings.model.module';
import { UserModelModule } from '../../models/user/user.model.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentModelModule } from '../../models/appointment/appointment.model.module';
import { NotificationModelModule } from 'src/models/notification/notification.model.module';
import { NotificationReminderModule } from '../../api/routes/notification-reminder/notification-reminder.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModelModule,
    PatientAlertSettingsModelModule,
    PatientAlertModule,
    AppointmentModelModule,
    NotificationModelModule,
    NotificationReminderModule,
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
