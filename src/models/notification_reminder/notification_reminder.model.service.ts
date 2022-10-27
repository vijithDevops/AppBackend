import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNotificationReminderDto } from 'src/api/routes/notification-reminder/dto';
import { Repository } from 'typeorm';
import { NotificationReminder } from './entity/notification_reminder.entity';
import { ReminderEvent } from './entity/notification_reminder.enum';
import { NotificationReminderTime } from './entity/notification_reminder_time.entity';
import { PatientReminders } from './entity/patient_reminders.view.entity';
import {
  ICreateNotificationReminder,
  ICreateNotificationReminderTime,
} from './interfaces';
import { IFindNotificationReminderFilter, IReminderTime } from './interfaces/';

@Injectable()
export class NotificationReminderModelService {
  constructor(
    @InjectRepository(NotificationReminder)
    private notificationReminderRepository: Repository<NotificationReminder>,
    @InjectRepository(PatientReminders)
    private patientRemindersRepository: Repository<PatientReminders>,
    @InjectRepository(NotificationReminderTime)
    private notificationReminderTimeRepository: Repository<NotificationReminderTime>,
  ) {}

  async create(
    createDto: CreateNotificationReminderDto,
    reminderId: string = null,
  ) {
    return await this.notificationReminderRepository.save({
      ...createDto,
      reminderId,
    });
  }

  async createnotificationReminder(dto: ICreateNotificationReminder) {
    return await this.notificationReminderRepository.save(dto);
  }

  async createnotificationReminderTime(dto: ICreateNotificationReminderTime[]) {
    return await this.notificationReminderTimeRepository.save(dto);
  }

  async updateNotificationReminderObject(
    reminder: CreateNotificationReminderDto,
  ): Promise<NotificationReminder> {
    return await this.notificationReminderRepository.save(reminder);
  }

  async findOne(id: string, patientId?: string): Promise<NotificationReminder> {
    const where = {
      id,
    };
    if (patientId) {
      where['patientId'] = patientId;
    }
    return await this.notificationReminderRepository.findOne(where, {
      relations: ['reminderTimes'],
    });
  }

  async findDefaulOneByType(
    type: ReminderEvent,
  ): Promise<NotificationReminder> {
    return await this.notificationReminderRepository.findOne(
      {
        type,
        isDefault: true,
        patientId: null,
      },
      { relations: ['reminderTimes'] },
    );
  }

  async getAllDefaultReminders(): Promise<NotificationReminder[]> {
    return await this.notificationReminderRepository.find({
      where: {
        isDefault: true,
        patientId: null,
      },
      relations: ['reminderTimes'],
    });
  }

  async getAllDefaultRemindersTimes(): Promise<NotificationReminderTime[]> {
    return await this.notificationReminderTimeRepository
      .createQueryBuilder('reminderTime')
      .where(
        'reminderTime.isDefault = :isDefault AND reminderTime.isUTC =:isUTC',
      )
      .innerJoinAndSelect(
        'reminderTime.notificationReminder',
        'reminder',
        'reminder.patientId IS NULL AND reminder.isDefault =:isDefault',
      )
      .setParameters({
        isDefault: true,
        isUTC: false,
      })
      .getMany();
  }

  async getNotificationReminderBySchedulerId(
    schedulerId: string,
  ): Promise<NotificationReminder> {
    const reminderTime = await this.notificationReminderTimeRepository
      .createQueryBuilder('reminderTime')
      .where('reminderTime.schedulerId = :schedulerId', { schedulerId })
      .leftJoinAndSelect(
        'reminderTime.notificationReminder',
        'notificationReminder',
      )
      .leftJoinAndSelect(
        'notificationReminder.medicationPrescription',
        'medicationPrescription',
      )
      .leftJoinAndSelect(
        'notificationReminder.breatingExercisePrescription',
        'breatingExercisePrescription',
      )
      .leftJoinAndSelect('notificationReminder.patient', 'patient')
      .getOne();
    if (reminderTime) {
      return reminderTime.notificationReminder;
    } else {
      throw new Error('Invalid Scheduler Id for notification reminder');
    }
  }

  async getPatientsDefaultRemindersByTimeAndType(
    reminderTime: IReminderTime,
    reminderTypes: ReminderEvent[],
    organizationId?: string,
  ): Promise<PatientReminders[]> {
    const query = this.patientRemindersRepository
      .createQueryBuilder('patientReminder')
      .where(
        'patientReminder.isDefault =:isDefault AND patientReminder.isActive =:isActive',
        { isDefault: true, isActive: true },
      )
      .andWhere('patientReminder.type IN (:...reminderTypes)', {
        reminderTypes,
      })
      .innerJoinAndSelect(
        'patientReminder.reminderTimes',
        'reminderTimes',
        'reminderTimes.hour =:hour AND reminderTimes.minute =:minute AND reminderTimes.isDefault =:isDefault AND reminderTimes.isUTC =:isUTC',
        { ...reminderTime, isUTC: false },
      )
      .innerJoin('patientReminder.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.username',
      ]);
    if (organizationId) {
      query.andWhere('patient.organizationId =:organizationId', {
        organizationId,
      });
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async findPatientDefaulByType(
    patientId: string,
    type: ReminderEvent,
  ): Promise<NotificationReminder> {
    return await this.notificationReminderRepository.findOne(
      {
        type,
        isDefault: true,
        patientId: patientId,
      },
      { relations: ['reminderTimes'] },
    );
  }

  async isPatientDefaultExist(
    patientId: string,
    type: ReminderEvent,
  ): Promise<boolean> {
    const count = await this.notificationReminderRepository.count({
      type,
      isDefault: true,
      patientId: patientId,
    });
    return !!count;
  }

  async getDefaultReminderTimesByType(
    type: ReminderEvent,
  ): Promise<NotificationReminderTime[]> {
    const reminder = await this.findDefaulOneByType(type);
    return reminder.reminderTimes;
  }

  async softDelete(id: string) {
    return await this.notificationReminderRepository.softDelete(id);
  }

  async findOneDetailsByReminderId(
    id: string,
    reminderType?: ReminderEvent,
  ): Promise<NotificationReminder> {
    const where = {
      reminderId: id,
    };
    if (reminderType) {
      where['eventType'] = reminderType;
    }
    return await this.notificationReminderRepository.findOne({
      where,
      relations: [
        'patient',
        'medicationPrescription',
        'breatingExercisePrescription',
      ],
    });
  }

  async findOneDetailsById(
    id: string,
    patientId?: string,
  ): Promise<NotificationReminder> {
    const where = {
      id,
    };
    if (patientId) {
      where['patientId'] = patientId;
    }
    return await this.notificationReminderRepository
      .findOne({
        where,
        relations: [
          'reminderTimes',
          'medicationPrescription',
          'breatingExercisePrescription',
        ],
      })
      .catch((err) => {
        throw err;
      });
  }

  async deleteReminderTimesbyId(ids: string[]) {
    try {
      return await this.notificationReminderTimeRepository
        .createQueryBuilder('reminderTimes')
        .delete()
        .where('id IN (:...ids)', { ids })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async deleteReminderById(id: string) {
    try {
      return await this.notificationReminderRepository
        .createQueryBuilder('reminder')
        .delete()
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async updateReminderStatus(id: string, isActive: boolean) {
    try {
      return await this.notificationReminderRepository
        .createQueryBuilder('reminder')
        .update()
        .set({ isActive })
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async findAllPatientRemindersPaginatedAndFilter(
    patientId: string,
    filterOptions: IFindNotificationReminderFilter,
  ) {
    const query = this.patientRemindersRepository
      .createQueryBuilder('reminders')
      .where('reminders.patientId =:patientId', {
        patientId,
      })
      .leftJoinAndSelect('reminders.reminderTimes', 'reminderTimes')
      .leftJoinAndSelect(
        'reminders.medicationPrescription',
        'medicationPrescription',
      )
      .leftJoinAndSelect(
        'reminders.breatingExercisePrescription',
        'breatingExercisePrescription',
      );
    const countQuery = this.patientRemindersRepository
      .createQueryBuilder('reminders')
      .where('reminders.patientId =:patientId', {
        patientId,
      });
    if (filterOptions.eventType) {
      query.andWhere('reminders.type =:type', {
        type: filterOptions.eventType,
      });
    }
    if (filterOptions.medicationPrescriptionId) {
      query.andWhere(
        'reminders.medicationPrescriptionId =:medicationPrescriptionId',
        { medicationPrescriptionId: filterOptions.medicationPrescriptionId },
      );
      countQuery.andWhere(
        'reminders.medicationPrescriptionId =:medicationPrescriptionId',
        { medicationPrescriptionId: filterOptions.medicationPrescriptionId },
      );
    }
    if (filterOptions.breathingPrescriptionId) {
      query.andWhere(
        'reminders.breathingPrescriptionId =:breathingPrescriptionId',
        { breathingPrescriptionId: filterOptions.breathingPrescriptionId },
      );
      countQuery.andWhere(
        'reminders.breathingPrescriptionId =:breathingPrescriptionId',
        { breathingPrescriptionId: filterOptions.breathingPrescriptionId },
      );
    }
    if (filterOptions.isDefault || filterOptions.isDefault === false) {
      query.andWhere('reminders.isDefault =:isDefault', {
        isDefault: filterOptions.isDefault,
      });
      countQuery.andWhere('reminders.isDefault =:isDefault', {
        isDefault: filterOptions.isDefault,
      });
    }
    query
      .orderBy('reminders.isDefault', 'DESC')
      .addOrderBy('reminders.type', 'ASC')
      .offset(filterOptions.skip)
      .limit(filterOptions.limit);
    const [data, count] = await Promise.all([
      query.getMany(),
      countQuery.getCount(),
    ]).catch((err) => {
      throw err;
    });
    return { data, totalCount: count };
  }
}
