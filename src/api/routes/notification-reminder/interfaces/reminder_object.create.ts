import { ICreateDailyReminderOptions } from 'src/services/event-scheduler/interfaces';
import { DAILY_REMINDER } from '../../../../services/event-scheduler/event-scheduler.enum';

export class ICreatePatientPrescriptionReminderObject {
  type:
    | DAILY_REMINDER.MEDICATION_REMINDER
    | DAILY_REMINDER.BREATHING_EXERCISE_REMINDER;
  payload: {
    id: string;
  };
  reminderOptions?: ICreateDailyReminderOptions;
}
