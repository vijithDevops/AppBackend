import { DAILY_REMINDER } from '../event-scheduler.enum';
import { ICreateReminderPayload } from './scheduler_payloads';

export class ICreateDailyReminder {
  type: DAILY_REMINDER;
  remindAtHour: number;
  remindAtMinute: number;
  payload?: ICreateReminderPayload = {};
  reminderOptions?: ICreateDailyReminderOptions;
}

export class IUpdateDailyReminder {
  reminderId: string;
  type: DAILY_REMINDER;
  remindAtHour: number;
  remindAtMinute: number;
  payload?: ICreateReminderPayload = {};
  reminderOptions?: ICreateDailyReminderOptions;
}

export class ICreateDailyReminderOptions {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  skipImmediate?: boolean;
}

export class IDeleteDailyReminder {
  reminderId: string;
  type: DAILY_REMINDER;
}
