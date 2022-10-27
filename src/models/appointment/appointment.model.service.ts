import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { UpdateAppointmentDto } from 'src/api/routes/appointment/dto';
import { LogService } from 'src/services/logger/logger.service';
import { Connection, Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { Appointment } from './entity/appointment.entity';
import {
  AppointmentCategory,
  AppointmentStatus,
  UserAppointmentStatus,
} from './entity/appointment.enum';
import { AppointmentUsers } from './entity/appointment_users.entity';
import { UserAppointments } from './entity/user_appointment.view.entity';
import {
  IAddAppointmentUsersPaginateFilter,
  ICreateAppointment,
  ICreateAppointmentUser,
  IFindAllAppointemntsOptions,
  IFindUserAppointemnts,
  IUpdateAppointmentStatusFilter,
} from './interfaces';
import { AddAppointmentUserListPaginateSQL } from './sql';
@Injectable()
export class AppointmentModelService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentUsers)
    private appointmentUserRepository: Repository<AppointmentUsers>,
    @InjectRepository(UserAppointments)
    private userAppointmentsViewRepository: Repository<UserAppointments>,
    private logService: LogService,
  ) {}

  async create(createAppointment: ICreateAppointment) {
    return await this.appointmentRepository.save(createAppointment);
  }

  async isAnyUpComingAppointmentExist(
    createAppointment: {
      patientId: string;
      doctorId: string;
      startTime: Date;
      endTime: Date;
    },
    ignoreId?: string,
  ) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where(
        '((appointment.patientId =:patientId) OR (appointment.doctorId =:doctorId)) AND appointment.status IN (:...status)',
        {
          patientId: createAppointment.patientId,
          doctorId: createAppointment.doctorId,
          status: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
        },
      )
      .andWhere(
        '(((start_time <= :startTime) AND (end_time > :startTime)) OR ((start_time < :endTime) AND (end_time >= :endTime)) OR ((:startTime <= start_time) AND (:endTime > start_time)))',
        // '(start_time BETWEEN :startTime AND :endTime) || (end_time BETWEEN :startTime AND :endTime)',
      )
      .setParameters({
        startTime: new Date(createAppointment.startTime),
        endTime: new Date(createAppointment.endTime),
      });
    if (ignoreId) {
      query.andWhere(`appointment.id NOT IN (:ignoreId)`, { ignoreId });
    }
    return !!(await query.getCount().catch((err) => {
      this.logService.logError(
        'Error in checking for confirmed appointment',
        err,
      );
    }));
  }

  async findAllAppointmentsPaginated(options: IFindAllAppointemntsOptions) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .select([
        'appointment.id',
        'appointment.title',
        'appointment.startTime',
        'appointment.endTime',
        'appointment.type',
        'appointment.status',
        'appointment.patientId',
        'appointment.doctorId',
        'appointment.organizationId',
        'appointment.isAckRequired',
        'appointment.calendarId',
        'appointment.createdAt',
        'appointment.updatedAt',
      ])
      .leftJoin('appointment.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.username',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.email',
        'patient.profilePic',
        'patient.profilePicThumbnail',
        'patient.role',
        'patient.isBlocked',
      ])
      .leftJoin('appointment.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.username',
        'doctor.firstName',
        'doctor.middleName',
        'doctor.lastName',
        'doctor.email',
        'doctor.profilePic',
        'doctor.profilePicThumbnail',
        'doctor.role',
        'doctor.isBlocked',
      ])
      .innerJoin('appointment.appointmentUsers', 'userAppointment')
      .addSelect(['userAppointment.id', 'userAppointment.userId'])
      .leftJoin('appointment.appointmentUsers', 'appointmentUsers')
      .addSelect([
        'appointmentUsers.id',
        'appointmentUsers.status',
        'appointmentUsers.isOrganizer',
        'appointmentUsers.userId',
        'appointmentUsers.appointmentId',
      ])
      .leftJoin('appointmentUsers.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.email',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.role',
        'user.isBlocked',
      ])
      .leftJoin('appointment.organization', 'organization')
      .addSelect(['organization.id', 'organization.name']);
    // .orderBy('appointment.createdAt', 'DESC');
    if (options.organizationId) {
      query.andWhere('appointment.organizationId = :organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.doctorId) {
      query.andWhere('appointment.doctorId = :doctorId', {
        doctorId: options.doctorId,
      });
    }
    if (options.patientId) {
      query.andWhere('appointment.patientId = :patientId', {
        patientId: options.patientId,
      });
    }
    if (options.userId) {
      query.andWhere('userAppointment.userId = :userId', {
        userId: options.userId,
      });
    }
    if (options.calendarId) {
      query.andWhere('appointment.calendarId = :calendarId', {
        calendarId: options.calendarId,
      });
    }
    if (options.status && options.status.length > 0) {
      query
        .andWhere('appointment.status IN (:...status)')
        .setParameters({ status: options.status });
    }
    if (options.type) {
      query.andWhere('appointment.type = :type', {
        type: options.type,
      });
    }
    if (options.category) {
      switch (options.category) {
        case AppointmentCategory.UPCOMING:
          query.andWhere('appointment.status IN (:...categoryStatus)', {
            categoryStatus: [
              AppointmentStatus.PENDING,
              AppointmentStatus.CONFIRMED,
              AppointmentStatus.IN_PROGRESS,
            ],
          });
          break;
        case AppointmentCategory.COMPLETED:
          query.andWhere('appointment.status IN (:...categoryStatus)', {
            categoryStatus: [AppointmentStatus.COMPLETED],
          });
          break;
        case AppointmentCategory.CANCELLED:
          query.andWhere('appointment.status IN (:...categoryStatus)', {
            categoryStatus: [
              AppointmentStatus.REJECTED,
              AppointmentStatus.CANCELLED,
            ],
          });
          break;
      }
    }
    if (options.search) {
      query.andWhere(
        "((patient.firstName || ( CASE WHEN patient.middleName IS NULL THEN ' '  ELSE ' ' || patient.middleName || ' ' END ) || patient.lastName ILIKE :searchName) OR (appointment.title ILIKE :searchName))",
        {
          searchName: `%${options.search}%`,
        },
      );
    }
    if (options.field && options.sort) {
      query.orderBy(`appointment.${options.field}`, options.sort);
    } else {
      query.orderBy('appointment.createdAt', 'DESC');
    }
    const [data, count] = await query
      .skip(options.skip)
      .take(options.limit)
      .getManyAndCount()
      .catch((err) => {
        throw err;
      });
    return { data, totalCount: count };
  }

  async getUserAppointments(options: IFindUserAppointemnts) {
    const query = this.userAppointmentsViewRepository
      .createQueryBuilder('userAppointment')
      .leftJoin('userAppointment.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.username',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.email',
        'patient.profilePic',
        'patient.profilePicThumbnail',
        'patient.role',
        'patient.isBlocked',
      ])
      .leftJoin('userAppointment.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.username',
        'doctor.firstName',
        'doctor.middleName',
        'doctor.lastName',
        'doctor.email',
        'doctor.profilePic',
        'doctor.profilePicThumbnail',
        'doctor.role',
        'doctor.isBlocked',
      ]);
    if (options.search) {
      query.andWhere(
        "((patient.firstName || ( CASE WHEN patient.middleName) IS NULL THEN ' '  ELSE ' ' || patient.middleName || ' ' END ) || patient.lastName ILIKE :searchName) OR (userAppointment.title ILIKE :searchName))",
        {
          searchName: `%${options.search}%`,
        },
      );
    }
    if (options.doctorId) {
      query.andWhere('userAppointment.doctorId = :doctorId', {
        doctorId: options.doctorId,
      });
    }
    if (options.patientId) {
      query.andWhere('userAppointment.patientId = :patientId', {
        patientId: options.patientId,
      });
    }
    if (options.userId) {
      query.andWhere('userAppointment.userId = :userId', {
        userId: options.userId,
      });
    }
    if (options.calendarId) {
      query.andWhere('userAppointment.calendarId = :calendarId', {
        calendarId: options.calendarId,
      });
    }
    if (options.status) {
      query.andWhere('userAppointment.status = :status', {
        status: options.status,
      });
    }
    if (options.type) {
      query.andWhere('userAppointment.type = :type', {
        type: options.type,
      });
    }
    if (options.field && options.sort) {
      query.orderBy(`userAppointment.${options.field}`, options.sort);
    } else {
      query.orderBy('userAppointment.startTime', 'ASC');
    }
    if (options.limit) {
      query.take(options.limit);
    }
    return query.getMany();
  }

  findOneDetail(id: string) {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.id = :id', { id })
      .leftJoin('appointment.organization', 'organization')
      .addSelect('organization.id', 'organization.name')
      .leftJoin('appointment.appointmentUsers', 'appointmentUsers')
      .addSelect([
        'appointmentUsers.id',
        'appointmentUsers.userId',
        'appointmentUsers.status',
        'appointmentUsers.isOrganizer',
        'appointmentUsers.createdAt',
      ])
      .leftJoin('appointmentUsers.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.email',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.role',
        'user.isBlocked',
      ])
      .leftJoin('appointment.doctor', 'doctor')
      .addSelect([
        'doctor.id',
        'doctor.username',
        'doctor.firstName',
        'doctor.middleName',
        'doctor.lastName',
        'doctor.profilePic',
        'doctor.profilePicThumbnail',
        'doctor.role',
      ])
      .leftJoin('appointment.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.username',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.profilePic',
        'patient.profilePicThumbnail',
        'patient.role',
      ])
      .getOne()
      .catch((err) => {
        throw err;
      });
  }

  async findOne(id: string): Promise<Appointment> {
    return await this.appointmentRepository.findOne(id, {
      relations: ['appointmentUsers', 'patient', 'doctor'],
    });
  }

  async findOneById(id: string): Promise<Appointment> {
    return await this.appointmentRepository.findOne(id);
  }

  async findOneByReminderId(id: string): Promise<Appointment> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.reminderId = :id', { id })
      .leftJoinAndSelect('appointment.organization', 'organization')
      .leftJoinAndSelect('appointment.appointmentUsers', 'appointmentUsers')
      .leftJoinAndSelect('appointmentUsers.user', 'user')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .getOne()
      .catch((err) => {
        throw err;
      });
    // return await this.appointmentRepository.findOne({
    //   where: {
    //     reminderId: id,
    //   },
    //   relations: ['appointmentUsers', 'patient', 'doctor'],
    // });
  }

  async update(id: string, updateAppointment: UpdateAppointmentDto) {
    return await this.appointmentRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateAppointment })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError('Error in appointment update', err);
      });
  }

  async updateAllPartiesStatus(
    appointmentId: string,
    status: UserAppointmentStatus,
    ecxludeUserIds?: string[],
  ) {
    const updateQuery = this.appointmentUserRepository
      .createQueryBuilder()
      .update()
      .set({ status })
      .where('appointmentId = :appointmentId', { appointmentId });
    if (ecxludeUserIds && ecxludeUserIds.length > 0) {
      updateQuery.andWhere('userId NOT IN(:..ecxludeUserIds)', {
        ecxludeUserIds,
      });
    }
    return await updateQuery.execute().catch((err) => {
      this.logService.logError(
        'Error in updating all appointment parties status',
        err,
      );
    });
  }

  async updateAppointmentReminderId(appointmentId: string, reminderId: string) {
    return await this.appointmentRepository.save({
      id: appointmentId,
      reminderId: reminderId,
    });
  }

  async remove(id: string): Promise<void> {
    await this.appointmentRepository.delete(id);
  }

  async createAppointmentUsers(
    createAppointmentUsers: ICreateAppointmentUser[],
  ) {
    return await this.appointmentUserRepository.save(createAppointmentUsers);
  }

  async getAppointmetOrganizerId(appointmentId: string) {
    const appointmentOrganizer = await this.appointmentUserRepository.findOne({
      where: {
        appointmentId,
        isOrganizer: true,
      },
    });
    if (!appointmentOrganizer) {
      throw new Error('Invalid Appointment');
    }
    return appointmentOrganizer.userId;
  }

  async getUserStatus(
    appointmentId: string,
    userId: string,
  ): Promise<UserAppointmentStatus> {
    const userAppointment = await this.appointmentUserRepository.findOne({
      where: {
        appointmentId,
        userId,
      },
    });
    if (!userAppointment) {
      throw new Error('Invalid user appointment');
    }
    return userAppointment.status;
  }

  async updateUserAppointmentStatus(
    appointmentId: string,
    userId: string,
    status: UserAppointmentStatus,
  ) {
    return await this.appointmentUserRepository
      .createQueryBuilder()
      .update()
      .set({ status })
      .where('appointmentId = :appointmentId', { appointmentId })
      .andWhere('userId = :userId', { userId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating user appointment status', err);
      });
  }

  async getUserAppointmentData(
    appointmentId: string,
    userId: string,
  ): Promise<UserAppointments> {
    return await this.userAppointmentsViewRepository.findOne({
      appointmentId,
      userId,
    });
  }

  async getAppointmentSecretAndSalt(
    appointmentId: string,
  ): Promise<Appointment> {
    return await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      select: ['id', 'secret', 'salt'],
    });
  }

  async getAddAppointmentUsersListPaginated(
    filter: IAddAppointmentUsersPaginateFilter,
  ): Promise<{ data: User[]; totalCount: number }> {
    try {
      const sqlParams = [];
      if (filter.search) {
        sqlParams.push(`%${filter.search}%`);
      }
      const { listQuery, countQuery } = AddAppointmentUserListPaginateSQL(
        filter,
      );
      const [data, totalCount] = await Promise.all([
        this.connection.query(listQuery, sqlParams),
        this.connection.query(countQuery, sqlParams),
      ]);
      return {
        data,
        totalCount: parseInt(totalCount[0].count),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentStatus(
    from: AppointmentStatus[],
    to: AppointmentStatus,
    filterOptions?: IUpdateAppointmentStatusFilter,
  ) {
    const updateQuery = this.appointmentRepository
      .createQueryBuilder()
      .update()
      .set({ status: to })
      .where(' status IN (:...from)', { from });
    if (filterOptions.endTimeLessThan) {
      updateQuery.andWhere('endTime < :endTimeLessThan', {
        endTimeLessThan: filterOptions.endTimeLessThan,
      });
    }
    if (filterOptions.startTimeLessThanOrEqualTo) {
      updateQuery.andWhere('startTime <=:startTimeLessThanOrEqualTo', {
        startTimeLessThanOrEqualTo: filterOptions.startTimeLessThanOrEqualTo,
      });
    }
    if (filterOptions.endTimeLessThanOrEqualTo) {
      updateQuery.andWhere('endTime <=:endTimeLessThanOrEqualTo', {
        endTimeLessThanOrEqualTo: filterOptions.endTimeLessThanOrEqualTo,
      });
    }
    return await updateQuery.execute().catch((err) => {
      this.logService.logError('Error in appointment Status update', err);
    });
  }

  async updateAppointmentSecretAndSalt(
    appointmentId: string,
    secret: string,
    salt: string,
  ) {
    return await this.appointmentRepository
      .createQueryBuilder()
      .update()
      .set({ secret, salt })
      .where('id =:appointmentId', { appointmentId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error in appointment Secret key update', err);
      });
  }
}
