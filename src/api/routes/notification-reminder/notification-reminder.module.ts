import { Module } from '@nestjs/common';
import { NotificationReminderService } from './notification-reminder.service';
import { NotificationReminderController } from './notification-reminder.controller';
import { EventSchedulerModule } from '../../../services/event-scheduler/event-scheduler.module';
import { NotificationReminderModelModule } from '../../../models/notification_reminder/notification_reminder.model.module';
import { BreatingExercisePrescriptionModelModule } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.module';
import { MedicationPrescriptionModelModule } from '../../../models/medication_prescription/medication_prescription.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { NotificationServiceModule } from '../../../services/notification/notification.module';

@Module({
  imports: [
    NotificationReminderModelModule,
    MedicationPrescriptionModelModule,
    BreatingExercisePrescriptionModelModule,
    EventSchedulerModule,
    UserModelModule,
    NotificationServiceModule,
  ],
  controllers: [NotificationReminderController],
  providers: [NotificationReminderService],
  exports: [NotificationReminderService],
})
export class NotificationReminderModule {}
