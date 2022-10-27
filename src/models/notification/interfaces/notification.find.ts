import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';
import { eventCategory } from 'src/models/notification_event_master/entity/notification_event.enum';

export class IGetUserNotificationsFilter {
  userId: string;
  actorId?: string;
  event?: NOTIFICATION_EVENT[];
  eventCategory?: eventCategory[];
  isRead?: boolean;
  isAcknowledged?: boolean;
  acknowledgeRequired?: boolean;
}
export class IGetUserNotificationsFilterPaginated extends IGetUserNotificationsFilter {
  skip: number;
  limit: number;
}
