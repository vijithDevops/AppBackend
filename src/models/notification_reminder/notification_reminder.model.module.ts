import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationReminderModelService } from './notification_reminder.model.service';
import { NotificationReminder } from './entity/notification_reminder.entity';
import { PatientReminders } from './entity/patient_reminders.view.entity';
import { NotificationReminderTime } from './entity/notification_reminder_time.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationReminder,
      NotificationReminderTime,
      PatientReminders,
    ]),
  ],
  providers: [NotificationReminderModelService],
  exports: [NotificationReminderModelService],
})
export class NotificationReminderModelModule {}
