import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationObject } from './entity/notification_object.entity';
import { NotificationNotifier } from './entity/notification_notifier.entity';
import { UserNotifications } from './entity/user_notifications.view.entity';
import {
  ICreateNotificationNotifiers,
  ICreateNotificationObject,
  IGetUserNotificationsFilter,
  IGetUserNotificationsFilterPaginated,
  IUpdateNotifier,
} from './interfaces';
import { LogService } from 'src/services/logger/logger.service';
import { eventCategory } from '../notification_event_master/entity/notification_event.enum';
import { NOTIFICATION_EVENT } from 'src/config/master-data-constants';
import { getDistinctArray } from 'src/common/utils/helpers';

@Injectable()
export class NotificationModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(NotificationObject)
    private notificationObjectRepository: Repository<NotificationObject>,
    @InjectRepository(NotificationNotifier)
    private notificationNotifierRepository: Repository<NotificationNotifier>,
    @InjectRepository(UserNotifications)
    private userNotificationsRepository: Repository<UserNotifications>,
  ) {}

  async createNotificationObject(
    data: ICreateNotificationObject,
  ): Promise<NotificationObject> {
    return await this.notificationObjectRepository.save(data).catch((err) => {
      throw err;
    });
  }

  async getOneUserNotification(
    id: string,
    userId?: string,
  ): Promise<UserNotifications> {
    const query = { id };
    if (userId) query['userId'] = userId;
    return await this.userNotificationsRepository
      .findOne(query)
      .catch((err) => {
        throw err;
      });
  }

  async createNotificationNotifiers(data: ICreateNotificationNotifiers[]) {
    return await this.notificationNotifierRepository
      .createQueryBuilder()
      .insert()
      .into(NotificationNotifier)
      .values(data)
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async findUserNotificationsPaginated(
    filter: IGetUserNotificationsFilterPaginated,
  ) {
    const query = this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .where('userNotifications.userId =:userId', {
        userId: filter.userId,
      });
    if (filter.actorId) {
      query.andWhere('userNotifications.actorId =:actorId', {
        actorId: filter.actorId,
      });
    }
    if (filter.event && filter.event.length > 0) {
      query
        .andWhere('userNotifications.event IN (:...event)')
        .setParameters({ event: filter.event });
    }
    if (filter.eventCategory && filter.eventCategory.length > 0) {
      query
        .andWhere('userNotifications.eventCategory IN (:...eventCategory)')
        .setParameters({ eventCategory: filter.eventCategory });
    }
    if (filter.isRead || filter.isRead === false) {
      query.andWhere('userNotifications.isRead =:isRead', {
        isRead: filter.isRead,
      });
    }
    if (filter.isAcknowledged || filter.isAcknowledged === false) {
      query.andWhere('userNotifications.isAcknowledged =:isAcknowledged', {
        isAcknowledged: filter.isAcknowledged,
      });
    }
    query
      .leftJoin('userNotifications.actor', 'actor')
      .addSelect([
        'actor.id',
        'actor.firstName',
        'actor.middleName',
        'actor.lastName',
        'actor.profilePic',
        'actor.profilePicThumbnail',
        'actor.chatId',
      ])
      .offset(filter.skip)
      .limit(filter.limit)
      .addOrderBy('userNotifications.createdAt', 'DESC');
    const [data, count] = await query.getManyAndCount().catch((err) => {
      throw err;
    });
    return { data, totalCount: count };
  }

  async getAllUserNotifications(filter: IGetUserNotificationsFilter) {
    const query = this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .select([
        'userNotifications.id',
        'userNotifications.actorId',
        'userNotifications.userId',
        'userNotifications.event',
        'userNotifications.eventCategory',
        'userNotifications.acknowledgeRequired',
        'userNotifications.isAcknowledged',
        'userNotifications.isRead',
      ])
      .where('userNotifications.userId =:userId', {
        userId: filter.userId,
      });
    if (filter.actorId) {
      query.andWhere('userNotifications.actorId =:actorId', {
        actorId: filter.actorId,
      });
    }
    if (filter.event && filter.event.length > 0) {
      query
        .andWhere('userNotifications.event IN (:...event)')
        .setParameters({ event: filter.event });
    }
    if (filter.eventCategory && filter.eventCategory.length > 0) {
      query
        .andWhere('userNotifications.eventCategory IN (:...eventCategory)')
        .setParameters({ eventCategory: filter.eventCategory });
    }
    if (filter.isRead || filter.isRead === false) {
      query.andWhere('userNotifications.isRead =:isRead', {
        isRead: filter.isRead,
      });
    }
    if (filter.isAcknowledged || filter.isAcknowledged === false) {
      query.andWhere('userNotifications.isAcknowledged =:isAcknowledged', {
        isAcknowledged: filter.isAcknowledged,
      });
    }
    if (filter.acknowledgeRequired || filter.acknowledgeRequired === false) {
      query.andWhere(
        'userNotifications.acknowledgeRequired =:acknowledgeRequired',
        {
          acknowledgeRequired: filter.acknowledgeRequired,
        },
      );
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getDismissableUserNotifications(userId: string) {
    const query = this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .select([
        'userNotifications.id',
        'userNotifications.userId',
        'userNotifications.event',
        'userNotifications.eventCategory',
        'userNotifications.acknowledgeRequired',
        'userNotifications.isAcknowledged',
      ])
      .where('userNotifications.userId =:userId', {
        userId: userId,
      })
      .andWhere(
        '(userNotifications.acknowledgeRequired = true AND userNotifications.isAcknowledged = true) OR (userNotifications.acknowledgeRequired = false)',
      );
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async validateUserNotifications(
    ids: string[],
    userId: string,
  ): Promise<void> {
    const distinctIds = getDistinctArray(ids);
    const count = await this.notificationNotifierRepository
      .createQueryBuilder('notifier')
      .where('notifier.notifierId =:userId', {
        userId: userId,
      })
      .andWhere('notifier.id IN (:...ids)', { ids: distinctIds })
      .getCount()
      .catch((err) => {
        throw err;
      });
    if (count !== distinctIds.length) {
      throw Error('Invalid notification for user');
    }
  }

  async getAllExpiredNonMedicalNotifications(
    expiredAt: Date,
    filter: {
      event?: NOTIFICATION_EVENT[];
      isRead?: boolean;
      isAcknowledged?: boolean;
      acknowledgeRequired?: boolean;
    },
  ): Promise<UserNotifications[]> {
    const query = this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .select([
        'userNotifications.id',
        'userNotifications.notificationObjectId',
        'userNotifications.event',
        'userNotifications.eventType',
        'userNotifications.eventCategory',
        'userNotifications.createdAt',
      ])
      .where('userNotifications.eventCategory =:eventCategory', {
        eventCategory: eventCategory.NON_MEDICAL,
      })
      .andWhere('userNotifications.createdAt <= :expiredAt', { expiredAt });
    if (filter.event && filter.event.length > 0) {
      query
        .andWhere('userNotifications.event IN (:...event)')
        .setParameters({ event: filter.event });
    }
    if (filter.isRead || filter.isRead === false) {
      query.andWhere('userNotifications.isRead =:isRead', {
        isRead: filter.isRead,
      });
    }
    if (filter.isAcknowledged || filter.isAcknowledged === false) {
      query.andWhere('userNotifications.isAcknowledged =:isAcknowledged', {
        isAcknowledged: filter.isAcknowledged,
      });
    }
    if (filter.acknowledgeRequired || filter.acknowledgeRequired === false) {
      query.andWhere(
        'userNotifications.acknowledgeRequired =:acknowledgeRequired',
        {
          acknowledgeRequired: filter.acknowledgeRequired,
        },
      );
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async softDeleteNotificationsById(ids: string[]) {
    const updateRow = await this.notificationNotifierRepository
      .createQueryBuilder()
      .update()
      .set({ deletedAt: new Date() })
      .where('id IN (:...ids)', { ids })
      .execute()
      .catch((err) => {
        this.logService.logError('Failed to softdelete notifications', err);
      });
    return updateRow['affected'];
  }

  // async softDeleteNotifications(options: {}) {
  //   const updateRow = await this.notificationNotifierRepository
  //     .createQueryBuilder()
  //     .update()
  //     .set({ deletedAt: new Date() })
  //     .where('id IN (:...ids)', { ids })
  //     .execute()
  //     .catch((err) => {
  //       this.logService.logError('Failed to softdelete notifications', err);
  //     });
  //   return updateRow['affected'];
  // }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return await this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .where(
        'userNotifications.userId =:userId AND userNotifications.isRead = false',
        { userId },
      )
      .getCount()
      .catch((err) => {
        throw err;
      });
  }

  async getUnacknowledgeNotificationCount(userId: string): Promise<number> {
    return await this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .where('userNotifications.userId =:userId', { userId })
      .andWhere(
        'userNotifications.isAcknowledged = false AND userNotifications.acknowledgeRequired = true',
      )
      .getCount()
      .catch((err) => {
        throw err;
      });
  }

  async findOneNotifier(
    id: string,
    notifierId?: string,
  ): Promise<NotificationNotifier> {
    const where = {
      id,
    };
    if (notifierId) {
      where['notifierId'] = notifierId;
    }
    return await this.notificationNotifierRepository.findOne(where);
  }

  async updateNotifierObject(
    notifier: NotificationNotifier,
  ): Promise<NotificationNotifier> {
    return await this.notificationNotifierRepository
      .save(notifier)
      .catch((err) => {
        throw err;
      });
  }

  async updateAllNotificationReadStatusOfUser(userId: string) {
    const updateRow = await this.notificationNotifierRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('notifierId =:userId', { userId })
      .andWhere('isRead = false')
      .execute()
      .catch((err) => {
        this.logService.logError(
          'Error in updateAllNotificationReadStatusOfUser',
          err,
        );
      });
    return updateRow['affected'];
  }

  async updateNotifierById(id: string, dto: IUpdateNotifier) {
    const updateRow = await this.notificationNotifierRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where('id =:id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError('Error in updating notifier', err);
      });
    return updateRow['affected'];
  }
}
