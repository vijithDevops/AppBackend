import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';

export class IeventDetails {
  event: string;
  eventType: string;
  eventName: string;
  notificationType: NotificationType;
}
export class IMedicalAlerteventDetails {
  eventType: string;
  eventName: string;
  notificationType: NotificationType;
}
