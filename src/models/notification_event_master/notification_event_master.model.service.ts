import { NOTIFICATION_EVENT } from './../../config/master-data-constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEventMaster } from './entity/notification_event_master.entity';
import { INotificationeventDetails } from './interfaces';
import { IMedicalAlerteventDetails } from 'src/services/notification/interfaces';
import { NotificationType } from 'aws-sdk/clients/budgets';

@Injectable()
export class NotificationEventMasterModelService {
  constructor(
    @InjectRepository(NotificationEventMaster)
    private notificationEventMasterRepository: Repository<NotificationEventMaster>,
  ) {}

  async getNotificationEvent(
    event: INotificationeventDetails,
  ): Promise<NotificationEventMaster> {
    return await this.notificationEventMasterRepository.findOne(event);
  }

  async getMedicalAlertEventsBySettingsId(
    medicalAlertSettingsId: string,
    notificationType?: NotificationType,
  ): Promise<NotificationEventMaster[]> {
    const query = this.notificationEventMasterRepository
      .createQueryBuilder('notificationEvent')
      .where('notificationEvent.event = :medicalAlertEvent', {
        medicalAlertEvent: NOTIFICATION_EVENT.MEDICAL_ALERT,
      })
      .leftJoinAndSelect(
        'notificationEvent.medicalAlertNotificationSettings',
        'medicalAlertNotificationSettings',
        'medicalAlertNotificationSettings.medicalAlertSettingsId = :medicalAlertSettingsId',
        { medicalAlertSettingsId },
      );
    if (notificationType) {
      query.andWhere('notificationEvent.notificationType =:notificationType', {
        notificationType,
      });
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async findOneMedicalAlertEventsBySettingsId(
    medicalAlertSettingsId: string,
    event: IMedicalAlerteventDetails,
  ): Promise<NotificationEventMaster> {
    return await this.notificationEventMasterRepository
      .createQueryBuilder('notificationEvent')
      .where('notificationEvent.event = :medicalAlertEvent', {
        medicalAlertEvent: NOTIFICATION_EVENT.MEDICAL_ALERT,
      })
      .andWhere(
        'notificationEvent.eventType = :eventType AND notificationEvent.eventName =:eventName AND notificationEvent.notificationType =:notificationType',
        { ...event },
      )
      .leftJoinAndSelect(
        'notificationEvent.medicalAlertNotificationSettings',
        'medicalAlertNotificationSettings',
        'medicalAlertNotificationSettings.medicalAlertSettingsId = :medicalAlertSettingsId',
        { medicalAlertSettingsId },
      )
      .getOne()
      .catch((err) => {
        throw err;
      });
  }

  async getAllMedicalAlertEvents(): Promise<NotificationEventMaster[]> {
    return await this.notificationEventMasterRepository
      .createQueryBuilder('notificationEvent')
      .where('notificationEvent.event = :medicalAlertEvent', {
        medicalAlertEvent: NOTIFICATION_EVENT.MEDICAL_ALERT,
      })
      .getMany()
      .catch((err) => {
        throw err;
      });
  }

  async getNotificationEventsByEvent(
    event: NOTIFICATION_EVENT,
  ): Promise<NotificationEventMaster[]> {
    return await this.notificationEventMasterRepository
      .createQueryBuilder('notificationEvent')
      .where('notificationEvent.event = :event', { event })
      .getMany()
      .catch((err) => {
        throw err;
      });
  }
}
