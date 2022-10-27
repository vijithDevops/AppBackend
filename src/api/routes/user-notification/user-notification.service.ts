import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';
import { NotificationNotifier } from 'src/models/notification/entity/notification_notifier.entity';
import { UserNotifications } from 'src/models/notification/entity/user_notifications.view.entity';
import { NotificationModelService } from 'src/models/notification/notification.model.service';
import { NotificationEventMasterModelService } from '../../../models/notification_event_master/notification_event_master.model.service';
import { camelCase } from 'lodash';

@Injectable()
export class UserNotificationService {
  constructor(
    private readonly notificationModelService: NotificationModelService,
    private readonly notificationEventMasterModelService: NotificationEventMasterModelService,
  ) {}

  async validateAndGetUserNotifierObject(
    id: string,
    notifierId: string,
  ): Promise<NotificationNotifier> {
    const notifierObject = await this.notificationModelService.findOneNotifier(
      id,
      notifierId,
    );
    if (!notifierObject) {
      throw new HttpException(
        'Invalid notification Id fro user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return notifierObject;
  }

  async updateNotifierReadStatus(
    notifier: NotificationNotifier,
  ): Promise<NotificationNotifier> {
    notifier.isRead = true;
    notifier.readAt = new Date();
    return await this.notificationModelService.updateNotifierObject(notifier);
  }

  async updateUserNotificationAcknowledgement(
    userNotification: UserNotifications,
  ): Promise<boolean> {
    if (userNotification.isAcknowledged) {
      return false;
    }
    const currentTime = new Date();
    const updateQuery = {
      isAcknowledged: true,
      acknowledgeAt: currentTime,
    };
    if (!userNotification.isRead) {
      updateQuery['isRead'] = true;
      updateQuery['readAt'] = currentTime;
    }
    await this.notificationModelService.updateNotifierById(
      userNotification.id,
      updateQuery,
    );
    return true;
  }

  async getCustomNotificationEvents(): Promise<{ [key: string]: string }> {
    const customEvents = await this.notificationEventMasterModelService.getNotificationEventsByEvent(
      NOTIFICATION_EVENT.CUSTOM_ALERT,
    );
    const customEventObj = {};
    customEvents.forEach((event) => {
      customEventObj[`${camelCase(event.eventName)}`] = event.messageTemplate;
    });
    return customEventObj;
  }

  async dismissAllUserNotifications(userId: string) {
    const dismissabeNotifications = await this.notificationModelService.getDismissableUserNotifications(
      userId,
    );
    const toBeDeletedIds = dismissabeNotifications.map((notification) => {
      return notification.id;
    });
    if (toBeDeletedIds.length > 0) {
      await this.notificationModelService.softDeleteNotificationsById(
        toBeDeletedIds,
      );
    }
  }

  async validateDeleteUserNotifications(
    userId: string,
    notificationsId: string[],
  ) {
    try {
      await this.notificationModelService.validateUserNotifications(
        notificationsId,
        userId,
      );
      // add more validations here
    } catch (error) {
      throw error;
    }
  }
}
