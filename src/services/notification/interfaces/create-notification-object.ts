import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';

export class ICreateNotificationObject {
  actorId: string;
  messageContent: string;
  messageTitle: string;
  messageHeader: string;
  payload: any;
  notificationEventId: string;
  acknowledgeRequired?: boolean = null;
}
export class INotificationEvent {
  event: NOTIFICATION_EVENT;
  eventType: string;
  eventName: string;
}
