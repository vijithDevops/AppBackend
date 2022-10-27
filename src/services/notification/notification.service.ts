import { Injectable } from '@nestjs/common';
import {
  ICreateNotificationMessage,
  ICreateNotificationObject,
  IeventDetails,
  IMedicalAlerteventDetails,
  INotificationEvent,
} from './interfaces';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { NotificationModelService } from '../../models/notification/notification.model.service';
import { UserAppDeviceModelService } from '../../models/user_app_device/user_app_device.model.service';
import { NotificationEventMasterModelService } from '../../models/notification_event_master/notification_event_master.model.service';
import { LogService } from '../logger/logger.service';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationModelService: NotificationModelService,
    private readonly notificationEventMasterModelService: NotificationEventMasterModelService,
    private readonly userAppDeviceModelService: UserAppDeviceModelService,
    private readonly pushNotificationService: PushNotificationService,
    private configService: ConfigService,
    private logService: LogService,
  ) {}

  async createNotificationMessage(
    event: IeventDetails,
    replaceValues: any,
    overrideMessage?: string,
  ): Promise<ICreateNotificationMessage> {
    try {
      const notificationEvent = await this.notificationEventMasterModelService.getNotificationEvent(
        event,
      );
      let message = overrideMessage
        ? overrideMessage
        : notificationEvent.messageTemplate;
      Object.keys(replaceValues).forEach((key) => {
        message = message.replace(`{${key}}`, replaceValues[key]);
      });
      return {
        messageContent: message,
        messageTitle: notificationEvent.messageTitle,
        messageHeader: notificationEvent.messageHeader,
        notificationEventId: notificationEvent.id,
      };
    } catch (error) {
      throw error;
    }
  }

  async createMedicalAlertNotificationMessage(
    medicalAlertSettingsId: string,
    event: IMedicalAlerteventDetails,
    replaceValues?: any,
  ): Promise<ICreateNotificationMessage> {
    try {
      const notificationEvent = await this.notificationEventMasterModelService.findOneMedicalAlertEventsBySettingsId(
        medicalAlertSettingsId,
        event,
      );
      let message =
        notificationEvent.medicalAlertNotificationSettings &&
        notificationEvent.medicalAlertNotificationSettings.length > 0
          ? notificationEvent.medicalAlertNotificationSettings[0]
              .messageTemplate
          : notificationEvent.messageTemplate;
      if (replaceValues) {
        Object.keys(replaceValues).forEach((key) => {
          message = message.replace(`{${key}}`, replaceValues[key]);
        });
      }
      return {
        messageContent: message,
        messageTitle: notificationEvent.messageTitle,
        notificationEventId: notificationEvent.id,
        messageHeader: notificationEvent.messageHeader,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMedicalAlertNotificationMessages(
    medicalAlertSettingsId: string,
    notificationType: NotificationType,
  ): Promise<{
    [key: string]: ICreateNotificationMessage;
  }> {
    try {
      const notificationEvents = await this.notificationEventMasterModelService.getMedicalAlertEventsBySettingsId(
        medicalAlertSettingsId,
        notificationType,
      );
      const notificationMessages = {};
      notificationEvents.forEach((event) => {
        notificationMessages[event.eventName] = {
          messageContent:
            event.medicalAlertNotificationSettings &&
            event.medicalAlertNotificationSettings.length > 0
              ? event.medicalAlertNotificationSettings[0].messageTemplate
              : event.messageTemplate,
          messageTitle: event.messageTitle,
          messageHeader: event.messageHeader,
          notificationEventId: event.id,
        };
      });
      return notificationMessages;
    } catch (error) {
      throw error;
    }
  }

  async generateNotification(
    createNotificationObject: ICreateNotificationObject,
    notifierIds: string[],
    event: INotificationEvent,
    sendPush = true,
    createInbox = true,
  ): Promise<void> {
    try {
      if (notifierIds && notifierIds.length > 0) {
        if (createInbox) {
          createNotificationObject.payload = {
            ...createNotificationObject.payload,
            ...event,
          };
          const notificationObject = await this.notificationModelService.createNotificationObject(
            createNotificationObject,
          );
          const createNotificationNotifiers = notifierIds.map((notifierId) => {
            return {
              notifierId,
              notificationObjectId: notificationObject.id,
              acknowledgeRequired: createNotificationObject.acknowledgeRequired,
            };
          });
          await this.notificationModelService.createNotificationNotifiers(
            createNotificationNotifiers,
          );
        }
        if (sendPush) {
          const userAppDevices = await this.userAppDeviceModelService.getAllDeviceOfUsers(
            notifierIds,
          );
          const notifiactionPayload = {
            title: createNotificationObject.messageHeader,
            body: createNotificationObject.messageTitle,
            data: {
              ...event,
              baseUrl: this.configService.get('WEB_APP_URL'),
            },
          };
          const pushTokens = [];
          userAppDevices.forEach((device) => {
            pushTokens.push(device.deviceToken);
          });
          if (pushTokens.length > 0) {
            const firebasePush = await this.pushNotificationService.sendMultiplePush(
              pushTokens,
              notifiactionPayload,
            );
            this.logService.logInfo(
              'Push notification send successfully',
              firebasePush,
            );
          }
        }
      } else {
        this.logService.logInfo(
          'No receivers to generate notification',
          createNotificationObject,
        );
      }
    } catch (error) {
      this.logService.logError(`Failed to generate notification`, {
        createNotificationObject,
        notifierIds,
        error,
      });
      throw error;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return await this.notificationModelService.getUnreadNotificationCount(
      userId,
    );
  }

  async getUnacknowledgedNotificationCount(userId: string): Promise<number> {
    return await this.notificationModelService.getUnacknowledgeNotificationCount(
      userId,
    );
  }
}
