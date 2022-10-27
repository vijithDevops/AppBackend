import { INotificationEvent } from 'src/services/notification/interfaces';

export class ICreateAlertNotificationMessageAndPayload {
  messages: {
    messageContent: string;
    messageTitle: string;
    messageHeader: string;
    notificationEventId: string;
  };
  payload: any = {};
  event: INotificationEvent;
}
