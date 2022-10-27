import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NonMedicalNotification } from './entity/non_medical_notification.entity';
import {
  ICreateNonMedicalNotification,
  IFindAllNonMedicalNotifications,
  IUpdateNonMedicalNotification,
} from './interfaces';
import { LogService } from '../../services/logger/logger.service';

@Injectable()
export class NonMedicalNotificationModelService {
  constructor(
    @InjectRepository(NonMedicalNotification)
    private nonMedicalNotificationRepository: Repository<NonMedicalNotification>,
    private logService: LogService,
  ) {}

  async create(
    dto: ICreateNonMedicalNotification,
  ): Promise<NonMedicalNotification> {
    return await this.nonMedicalNotificationRepository.save(dto);
  }

  async findOneById(id: string): Promise<NonMedicalNotification> {
    return await this.nonMedicalNotificationRepository.findOne({ id });
  }

  async findOneByFieldId(
    fieldId: string,
    organizationId?: string,
  ): Promise<NonMedicalNotification> {
    const query = { fieldId };
    if (organizationId) {
      query['organizationId'] = organizationId;
    }
    return await this.nonMedicalNotificationRepository.findOne(query);
  }

  async findAllPaginated(options?: IFindAllNonMedicalNotifications) {
    const query = this.nonMedicalNotificationRepository.createQueryBuilder(
      'notification',
    );
    if (options.organizationId) {
      query.andWhere('notification.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.search) {
      query.andWhere('(notification.fieldId ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }
    if (options.notifyClinician || options.notifyClinician === false) {
      query.andWhere('notification.notifyClinician =:notifyClinician', {
        notifyClinician: options.notifyClinician,
      });
    }
    if (options.notifyCaregiver || options.notifyCaregiver === false) {
      query.andWhere('notification.notifyCaregiver =:notifyCaregiver', {
        notifyCaregiver: options.notifyCaregiver,
      });
    }
    if (options.patientAckRequired || options.patientAckRequired === false) {
      query.andWhere('notification.patientAckRequired =:patientAckRequired', {
        patientAckRequired: options.patientAckRequired,
      });
    }
    if (
      options.caregiverAckRequired ||
      options.caregiverAckRequired === false
    ) {
      query.andWhere(
        'notification.caregiverAckRequired =:caregiverAckRequired',
        {
          caregiverAckRequired: options.caregiverAckRequired,
        },
      );
    }
    const [data, count] = await query
      .orderBy('notification.createdAt', options.sort)
      .offset(options.skip)
      .limit(options.limit)
      .getManyAndCount();
    return { data, totalCount: count };
  }

  async delete(id: string): Promise<void> {
    await this.nonMedicalNotificationRepository.delete(id).catch((err) => {
      this.logService.logError('Error deleting non medical notification', err);
      throw new Error('Failed to delete non medical notification');
    });
  }

  async update(id: string, updateDto: IUpdateNonMedicalNotification) {
    return await this.nonMedicalNotificationRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateDto })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError(
          'Error updating non medical notification',
          err,
        );
      });
  }
}
