import { NotificationType } from '../entity/notification_event.enum';

export class INotificationeventDetails {
  event: string;
  eventType: string;
  eventName: string;
  notificationType: NotificationType;
}
