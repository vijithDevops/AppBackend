export class ICreateAlertNotificationMessageAndPayload {
  messages: {
    messageContent: string;
    messageTitle: string;
    notificationEventId: string;
  };
  payload: any = {};
}
