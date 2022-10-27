export class ICreateNotificationObject {
  actorId: string;
  messageContent: string;
  messageTitle: string;
  payload: any;
  notificationEventId: string;
}

export class ICreateNotificationNotifiers {
  notifierId: string;
  notificationObjectId: string;
}
