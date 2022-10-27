import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';
import { eventCategory } from 'src/models/notification_event_master/entity/notification_event.enum';

export class IDeleteUserNotificationOptions {
  event?: NOTIFICATION_EVENT[];
  eventCategory?: eventCategory[];
  isRead?: boolean;
  isAcknowledged?: boolean;
  acknowledgeRequired?: boolean;
}
