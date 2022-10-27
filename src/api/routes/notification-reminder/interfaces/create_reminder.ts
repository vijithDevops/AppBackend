import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';
import { DAILY_REMINDER } from 'src/services/event-scheduler/event-scheduler.enum';

export class ICreatePatientDefaultReminder {
  patientId: string;
  type: ReminderEvent;
  reminderTimes: ICreateRemindertimes[];
  isActive?: boolean = true;
}

export class ICreateRemindertimes {
  hour: number;
  minute: number;
  isUTC?: boolean = true;
  isDefault?: boolean = false;
}
export interface IReminderTime {
  hour: number;
  minute: number;
  isDefault: boolean;
}

export interface IDefaultReminderTimesObject {
  [key: string]: {
    hour: string;
    minute: string;
    types: DAILY_REMINDER[];
  };
}
