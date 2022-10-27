import { SCHEDULED_REMINDER } from '../event-scheduler.enum';
import { ICreateReminderPayload } from './scheduler_payloads';

export class ICreateScheduledReminder {
  type: SCHEDULED_REMINDER;
  remindAt: Date;
  payload: ICreateReminderPayload;
}

export class IUpdateScheduledReminder {
  reminderId: string;
  type: SCHEDULED_REMINDER;
  remindAt: Date;
  payload?: ICreateReminderPayload;
}

export class IDeleteScheduledReminder {
  reminderId: string;
  type: SCHEDULED_REMINDER;
}
