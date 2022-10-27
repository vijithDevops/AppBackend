import { ReminderEvent } from '../entity/notification_reminder.enum';

export class ICreateNotificationReminder {
  patientId: string;
  type: ReminderEvent;
  isDefault?: boolean;
  isActive?: boolean;
  medicationPrescriptionId?: string;
  breathingPrescriptionId?: string;
}

export class ICreateNotificationReminderTime {
  notificationReminderId: string;
  hour: number;
  minute: number;
  isDefault?: boolean;
}
