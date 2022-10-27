import { ReminderEvent } from '../entity/notification_reminder.enum';

export class IFindNotificationReminderFilter {
  skip: number;
  limit: number;
  eventType?: ReminderEvent;
  isDefault?: boolean;
  medicationPrescriptionId?: string;
  breathingPrescriptionId?: string;
}

export class IReminderTime {
  hour: number;
  minute: number;
  isDefault?: boolean = true;
}
