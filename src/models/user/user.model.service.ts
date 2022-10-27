import { subtractHours } from './../../common/utils/date_helper';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entity/user.entity';
import {
  BCRYPT_SALT_ROUNDS,
  GATEWAY_ONLINE_BEFORE,
} from '../../config/constants';
import {
  IChatUsersPaginateOptions,
  ICreateUser,
  IFindPatientListWithCareteam,
  IFindUserAssignedPatientsOptions,
  IFindUserOptions,
  IPatientCareTeamFilter,
  IUpdateUser,
  IUserFilter,
} from './interfaces';
import { Role } from './entity/user.enum';
import { ChatUserListPaginateSQL } from './sql/get_chat_users_list.sql';
import { AssignedPatientListPaginateSQL } from './sql/get_assigned_patient_list.sql';
import { AppointmentStatus } from '../appointment/entity/appointment.enum';
import { PatientInfo } from '../patient_info/entity/patient_info.entity';
import { subtractDays } from 'src/common/utils/date_helper';
import { RiskLevel } from '../medical_alerts/entity/medical_alerts.enum';
import { PatientSupervisionMapping } from '../patient_supervision_mapping/entity/patient_supervision_mapping.entity';
import { LogService } from 'src/services/logger/logger.service';
import { getUniqueArrayStringValues } from 'src/common/utils/helpers';

@Injectable()
export class UserModelService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectConnection() private connection: Connection,
    private logService: LogService,
  ) {}

  async createUser(createUser: ICreateUser): Promise<User> {
    createUser.password = await bcrypt.hash(
      createUser.password,
      BCRYPT_SALT_ROUNDS,
    );
    return await this.usersRepository.save(createUser);
  }

  async validateUserIds(ids: string[]): Promise<void> {
    const count = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids })
      .getCount();
    if (count !== ids.length) {
      throw new Error('Invalid user Id found');
    }
  }

  async getUsersMinInfo(userIds: string[]): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.organizationId',
        'user.role',
      ])
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();
  }

  async getAllPatientIntegerIdsInOrganization(
    organizationId: string,
  ): Promise<number[]> {
    const userData = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.organizationId'])
      .where(
        'user.organizationId =:organizationId AND user.role =:patientRole',
        { organizationId, patientRole: Role.PATIENT },
      )
      .innerJoin('user.patientInfo', 'patientInfo')
      .addSelect([
        'patientInfo.id',
        'patientInfo.patientId',
        'patientInfo.userId',
      ])
      .getMany();
    return userData.map((user) => {
      return user.patientInfo.patientId;
    });
  }

  async isUsernameExist(
    username: string,
    excludeIds?: string[],
  ): Promise<boolean> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .withDeleted();
    if (excludeIds && excludeIds.length > 0) {
      query
        .andWhere('user.id NOT IN (:...excludeIds)')
        .setParameters({ excludeIds });
    }
    return !!(await query.getCount());
  }

  async validateOrganizationOfUsers(
    userIds: string[],
    organizationId: string,
  ): Promise<void> {
    const uniqueIds = getUniqueArrayStringValues(userIds);
    const count = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds: uniqueIds })
      .andWhere('user.organizationId = :organizationId', { organizationId })
      .getCount();
    if (count !== uniqueIds.length) {
      throw new Error('Invalid user in the organization');
    }
  }

  async getUserIdFromChatId(chatIds: number[]): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.chatId'])
      .where('user.chatId IN (:...chatIds)', { chatIds })
      .getMany();
  }

  async getUserFullNameById(id: string): Promise<string> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.middleName', 'user.lastName'])
      .where('user.id =:id', { id })
      .getOne();
    return user.firstName + user.middleName + user.lastName;
  }

  async updateUserPassword(userId: string, password: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({
        password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
      })
      .where('id =:userId', { userId })
      .execute();
  }

  async patchUserById(userId: string, dto: IUpdateUser) {
    try {
      return await this.usersRepository
        .createQueryBuilder()
        .update()
        .set(dto)
        .where('id =:userId', { userId })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUser: IUpdateUser): Promise<User> {
    return await this.usersRepository
      .save({
        id,
        ...updateUser,
      })
      .catch((err) => {
        throw err;
      });
  }

  async getDoctor(id: string): Promise<User> {
    return await this.usersRepository.findOne({ id, role: Role.DOCTOR });
  }

  async getAdminUser(): Promise<User> {
    return await this.usersRepository.findOne({
      where: { role: Role.ADMIN },
      select: ['id', 'username', 'firstName'],
    });
  }

  async getAdminUserId(username?: string): Promise<string> {
    const query = {
      role: Role.ADMIN,
    };
    if (username) {
      query['username'] = username;
    }
    const adminUser = await this.usersRepository.findOne(query);
    if (!adminUser) {
      throw new Error('Failed to fetch admin user');
    }
    return adminUser.id;
  }

  async isUserEmailExistForOrganization(
    email: string,
    organizationId: string,
  ): Promise<boolean> {
    const userCount = await this.usersRepository.count({
      where: {
        email: email,
        organizationId: organizationId,
      },
    });
    if (userCount) {
      return true;
    } else {
      return false;
    }
  }

  async isUserPhoneNumberExistForOrganization(
    phoneNumber: string,
    organizationId: string,
  ): Promise<boolean> {
    const userCount = await this.usersRepository.count({
      where: {
        phoneNumber: phoneNumber,
        organizationId: organizationId,
      },
    });
    if (userCount) {
      return true;
    } else {
      return false;
    }
  }

  async getPatientInfoByUserId(userId: string): Promise<PatientInfo> {
    const patient = await this.usersRepository.findOne({
      where: { id: userId, role: Role.PATIENT },
      relations: ['patientInfo'],
    });
    if (patient && patient.patientInfo) {
      return patient.patientInfo;
    } else {
      throw new Error('Invalid patient');
    }
  }

  async getPatientInfoByUsername(username: string): Promise<PatientInfo> {
    // const patient = await this.usersRepository.findOne({
    //   where: { username: username, role: Role.PATIENT },
    //   relations: ['patientInfo'],
    // });
    const patient = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .andWhere('user.role =:role', { role: Role.PATIENT })
      .getOne();
    if (patient && patient.patientInfo) {
      return patient.patientInfo;
    } else {
      throw new Error('Invalid patient');
    }
  }

  async getAllValidPatientIntIds(): Promise<number[]> {
    const patients = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .where('user.role =:patientRole', { patientRole: Role.PATIENT })
      .innerJoin('user.patientInfo', 'patientInfo')
      .getMany();
    return patients.map((patient) => {
      return patient.patientInfo.patientId;
    });
  }

  async findAllPaginateAndFilter(options: IFindUserOptions) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .leftJoinAndSelect(
        'user.patientVitalRisks',
        'patientVitalRisks',
        'patientVitalRisks.updatedAt >= :vitalRiskExpiredAt',
        { vitalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoinAndSelect('patientVitalRisks.vitalSign', 'vitalSign')
      .leftJoinAndSelect(
        'user.patientMedicalRisk',
        'patientMedicalRisk',
        'patientMedicalRisk.updatedAt >= :medicalRiskExpiredAt',
        { medicalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoin('user.organization', 'organization')
      .addSelect([
        'organization.id',
        'organization.name',
        'organization.type',
        'organization.timezone',
      ])
      .leftJoin('user.vitalSignsSettings', 'vitalSignsSettings')
      .addSelect([
        'vitalSignsSettings.id',
        'vitalSignsSettings.name',
        'vitalSignsSettings.key',
        'vitalSignsSettings.measuringScale',
        'vitalSignsSettings.vitalSignName',
        'vitalSignsSettings.isApplicable',
        'vitalSignsSettings.amberValue',
        'vitalSignsSettings.redValue',
      ])
      .loadRelationCountAndMap(
        'user.unacknowledgedNotifications',
        'user.userNotificationUser',
        'userNotificationUser',
        (qb) =>
          qb.where(
            'userNotificationUser.acknowledgeRequired = true AND userNotificationUser.isAcknowledged = false',
          ),
      )
      .leftJoinAndMapOne(
        'user.patientSupervisors',
        PatientSupervisionMapping,
        'patientSupervisors',
        'patientSupervisors.patientId = user.id AND patientSupervisors.isIncharge =:isIncharge',
        {
          isIncharge: true,
        },
      )
      .leftJoin('patientSupervisors.user', 'supervisor')
      .addSelect([
        'supervisor.id',
        'supervisor.username',
        'supervisor.firstName',
        'supervisor.middleName',
        'supervisor.lastName',
        'supervisor.role',
        'supervisor.profilePic',
        'supervisor.profilePicThumbnail',
        'supervisor.chatId',
      ])
      // .offset(options.skip)
      // .limit(options.limit);
      .skip(options.skip)
      .take(options.limit);
    this.addUserListFilters(query, options);
    query.addOrderBy('user.id', 'DESC');
    const [[data, count], watchlistCount] = await Promise.all([
      query.getManyAndCount(),
      this.getWatchlistUserCount(options.organizationId),
    ]);
    return {
      data,
      totalCount: count,
      watchlistCount: watchlistCount,
    };
  }

  async getWatchlistUserCount(organizationId?: string): Promise<number> {
    const where = {
      isOnWatchlist: true,
    };
    if (organizationId) {
      where['organizationId'] = organizationId;
    }
    return await this.usersRepository.count({
      where,
    });
  }

  private addUserListFilters(
    query: SelectQueryBuilder<User>,
    filters: IFindUserOptions,
  ): SelectQueryBuilder<User> {
    try {
      if (filters.organizationId) {
        query.andWhere('user.organizationId = :organizationId', {
          organizationId: filters.organizationId,
        });
      }
      if (filters.roles && filters.roles.length > 0) {
        query.andWhere('user.role IN (:...roles)', { roles: filters.roles });
      }
      if (filters.excludeRoles && filters.excludeRoles.length > 0) {
        query.andWhere('user.role NOT IN (:...excludeRoles)', {
          excludeRoles: filters.excludeRoles,
        });
      }
      if (filters.excludeUserIds && filters.excludeUserIds.length > 0) {
        query.andWhere('user.id NOT IN (:...excludeUserIds)', {
          excludeUserIds: filters.excludeUserIds,
        });
      }
      if (filters.isOnWatchlist !== undefined) {
        query.andWhere('user.isOnWatchlist =:isOnWatchlist', {
          isOnWatchlist: filters.isOnWatchlist,
        });
      }
      if (filters.gatewayFilter) {
        this.addGatewayFilterQuery(query, filters);
      }
      if (filters.sensorFilter) {
        this.addSensorFilterQuery(query, filters);
      }
      if (filters.search) {
        query.andWhere(
          "((user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :search) OR (user.username ILIKE :search) OR (user.phoneNumber ILIKE :search))",
          {
            search: `%${filters.search}%`,
          },
        );
      }
      if (filters.fields) {
        this.applySortFilters(query, filters);
      }
      return query;
    } catch (error) {
      throw error;
    }
  }

  private applySortFilters(
    query: SelectQueryBuilder<User>,
    filters: IFindUserOptions,
  ): SelectQueryBuilder<User> {
    filters.fields.forEach((field, index) => {
      const sort =
        filters.sorts && filters.sorts[index] ? filters.sorts[index] : 'DESC';
      if (field === 'patientMedicalRisk') {
        query
          .addSelect(
            `
              (
                CASE
                  WHEN  patientMedicalRisk.risk_level = '${RiskLevel.RED}' THEN 1
                  WHEN  patientMedicalRisk.risk_level = '${RiskLevel.AMBER}' THEN 2
                  WHEN  patientMedicalRisk.risk_level = '${RiskLevel.GREEN}' THEN 3
                  WHEN  patientMedicalRisk.risk_level IS NULL THEN 3
                  ELSE 3
                END
              )
            `,
            'risk_value',
          )
          .addOrderBy('risk_value', sort);
      } else if (field === 'unregistering') {
        // query.addOrderBy('sensors.unassignRequest', sort, 'NULLS LAST');
        query.addOrderBy('sensors.unassignRequest', sort, 'NULLS LAST');
      } else if (field === 'registering') {
        query.addOrderBy('sensors.isRegistered', sort, 'NULLS LAST');
        query.addOrderBy('gateways.isRegistered', sort, 'NULLS LAST');
        query.addOrderBy('sensors.isActive', sort, 'NULLS LAST');
        query.addOrderBy('gateways.isActive', sort, 'NULLS LAST');
        query.addOrderBy('sensors.isPaired', sort, 'NULLS LAST');
        query.addOrderBy(
          'sensors.unassignRequest',
          sort === 'DESC' ? 'ASC' : 'DESC',
          'NULLS LAST',
        );
      } else if (field === 'lastConnectionTime') {
        query.addOrderBy('sensors.lastConnectionTime', sort, 'NULLS LAST');
        query.addOrderBy('gateways.lastConnectionTime', sort, 'NULLS LAST');
      } else if (field === 'isOnWatchlist') {
        query.addOrderBy('user.isOnWatchlist', sort, 'NULLS LAST');
      } else if (field === 'lastSyncTime') {
        query.addOrderBy('sensors.lastConnectionTime', sort, 'NULLS LAST'); // change when user lastSyncTime updated with lastconnectionTime
        query.addOrderBy('gateways.lastConnectionTime', sort, 'NULLS LAST');
      } else {
        query.addOrderBy(`user.${field}`, sort, 'NULLS LAST');
      }
    });
    return query;
  }

  private addGatewayFilterQuery(
    query: SelectQueryBuilder<User>,
    filters: IFindUserOptions,
  ): SelectQueryBuilder<User> {
    switch (filters.gatewayFilter) {
      case 'online':
        query.andWhere('gateways.lastConnectionTime >= :onlineTime', {
          onlineTime: subtractHours(GATEWAY_ONLINE_BEFORE, new Date()),
        });
        break;
      case 'offline':
        query.andWhere('gateways.lastConnectionTime < :offlineTime', {
          offlineTime: subtractHours(GATEWAY_ONLINE_BEFORE, new Date()),
        });
        break;
      case 'registering':
        query.andWhere(
          'gateways.isActive = true AND gateways.isRegistered = false',
        );
        break;
      default:
        throw new Error('Invalid filter for Gateway');
    }
    return query;
  }

  private addSensorFilterQuery(
    query: SelectQueryBuilder<User>,
    filters: IFindUserOptions,
  ): SelectQueryBuilder<User> {
    switch (filters.sensorFilter) {
      case 'online':
        query.andWhere('sensors.lastConnectionTime >= :onlineTime', {
          onlineTime: subtractHours(GATEWAY_ONLINE_BEFORE, new Date()),
        });
        break;
      case 'offline':
        query.andWhere('sensors.lastConnectionTime < :offlineTime', {
          offlineTime: subtractHours(GATEWAY_ONLINE_BEFORE, new Date()),
        });
        break;
      case 'registering':
        query.andWhere(
          'sensors.isActive = true AND sensors.isRegistered = false',
        );
        break;
      default:
        throw new Error('Invalid filter for Sensor');
    }
    return query;
  }

  async findAllBasicInfoPaginateAndFilter(options: IFindUserOptions) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.isOnWatchlist',
        'user.profilePic',
        'user.profilePicThumbnail',
      ])
      .leftJoin('user.patientInfo', 'patientInfo')
      .addSelect(['patientInfo.id', 'patientInfo.patientId'])
      .leftJoin('patientInfo.gateways', 'gateways')
      .leftJoin('user.doctorInfo', 'doctorInfo')
      .addSelect(['doctorInfo.id', 'doctorInfo.specialization'])
      .leftJoin('user.organization', 'organization')
      .addSelect(['organization.id', 'organization.name', 'organization.type'])
      .leftJoin(
        'user.patientMedicalRisk',
        'patientMedicalRisk',
        'patientMedicalRisk.updatedAt >= :medicalRiskExpiredAt',
        { medicalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .offset(options.skip)
      .limit(options.limit);
    this.addUserListFilters(query, options);
    query.addOrderBy('user.id', 'DESC');
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getAssignedPatientListPaginateAndFilter(
    options: IFindUserAssignedPatientsOptions,
  ): Promise<{ data: User[]; totalCount: number }> {
    try {
      const sqlParams = [options.userId, AppointmentStatus.CONFIRMED];
      if (options.search) {
        sqlParams.push(`%${options.search}%`);
      }
      const { listQuery, countQuery } = AssignedPatientListPaginateSQL(options);
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

  async getAssignedPatientListPaginateAndFilterV2(
    options: IFindUserAssignedPatientsOptions,
  ) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role =:patient', { patient: Role.PATIENT })
      .innerJoinAndMapOne(
        'user.patientSupervisors',
        PatientSupervisionMapping,
        'patientSupervisors',
        ' patientSupervisors.userId =:userId AND patientSupervisors.patientId = user.id',
      )
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .leftJoinAndSelect(
        'user.patientVitalRisks',
        'patientVitalRisks',
        'patientVitalRisks.updatedAt >= :vitalRiskExpiredAt',
        { vitalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoinAndSelect('patientVitalRisks.vitalSign', 'vitalSign')
      .leftJoinAndSelect(
        'user.patientMedicalRisk',
        'patientMedicalRisk',
        'patientMedicalRisk.updatedAt >= :medicalRiskExpiredAt',
        { medicalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoin('user.organization', 'organization')
      .addSelect(['organization.id', 'organization.name', 'organization.type'])
      .leftJoin('user.vitalSignsSettings', 'vitalSignsSettings')
      .addSelect([
        'vitalSignsSettings.id',
        'vitalSignsSettings.name',
        'vitalSignsSettings.key',
        'vitalSignsSettings.measuringScale',
        'vitalSignsSettings.vitalSignName',
        'vitalSignsSettings.isApplicable',
        'vitalSignsSettings.amberValue',
        'vitalSignsSettings.redValue',
      ])
      .loadRelationCountAndMap(
        'user.unacknowledgedNotifications',
        'user.userNotificationUser',
        'userNotificationUser',
        (qb) =>
          qb.where(
            'userNotificationUser.acknowledgeRequired = true AND userNotificationUser.isAcknowledged = false',
          ),
      )
      .loadRelationCountAndMap(
        'user.upcomingAppointmentsCount',
        'user.patientAppointments',
        'patientAppointments',
        (qb) =>
          qb.where(
            'patientAppointments.startTime >= :currentDate AND patientAppointments.status =:confirmedAppointmetnStatus',
            {
              confirmedAppointmetnStatus: AppointmentStatus.CONFIRMED,
              currentDate: new Date(),
            },
          ),
      )
      .loadRelationCountAndMap(
        'user.patientNotesCount',
        'user.patientNotesPatient',
        'patientNotesPatient',
      )
      .setParameters({
        userId: options.userId,
      })
      .skip(options.skip)
      .take(options.limit);
    if (options.search) {
      query.andWhere(
        "((user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :search) OR (user.username ILIKE :search) OR (user.phoneNumber ILIKE :search))",
        {
          search: `%${options.search}%`,
        },
      );
    }
    if (options.isOnWatchlist !== undefined) {
      query.andWhere('user.isOnWatchlist =:isOnWatchlist', {
        isOnWatchlist: options.isOnWatchlist,
      });
    }
    if (options.fields) {
      this.applySortFilters(query, options);
      // options.fields.forEach((field, index) => {
      //   const sort =
      //     options.sorts && options.sorts[index] ? options.sorts[index] : 'DESC';
      //   if (field === 'patientMedicalRisk') {
      //     query
      //       .addSelect(
      //         `
      //           (
      //             CASE
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.RED}' THEN 1
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.AMBER}' THEN 2
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.GREEN}' THEN 3
      //               WHEN  patientMedicalRisk.risk_level IS NULL THEN 4
      //               ELSE 4
      //             END
      //           )
      //         `,
      //         'risk_value',
      //       )
      //       .addOrderBy('risk_value', sort);
      //   } else if (field === 'lastConnectionTime') {
      //     query.addOrderBy('sensors.lastConnectionTime', sort, 'NULLS LAST');
      //     query.addOrderBy('gateways.lastConnectionTime', sort, 'NULLS LAST');
      //   } else if (field === 'registering') {
      //     query.addOrderBy('sensors.isRegistered', sort, 'NULLS LAST');
      //   } else if (field === 'unregistering') {
      //     query.addOrderBy('sensors.unassignRequest', sort, 'NULLS LAST');
      //   } else {
      //     query.addOrderBy(`user.${field}`, sort, 'NULLS LAST');
      //   }
      // });
    }
    // const rawResult = await query.getRawAndEntities();
    // return rawResult;
    const [[data, count], watchlistCount] = await Promise.all([
      query.getManyAndCount(),
      this.getAssignedPatientWatchlistCount(options.userId),
    ]);
    // const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count, watchlistCount };
  }

  async getAssignedPatientWatchlistCount(userId: string): Promise<number> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.role =:patient', { patient: Role.PATIENT })
      .andWhere('user.isOnWatchlist =:isOnWatchlist', { isOnWatchlist: true })
      .innerJoin(
        'user.patientSupervisors',
        'patientSupervisors',
        ' patientSupervisors.userId =:userId AND patientSupervisors.patientId = user.id',
        { userId },
      )
      .getCount();
  }

  async getAssignedPatientListBasicInfoPaginateAndFilter(
    options: IFindUserAssignedPatientsOptions,
  ) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.isOnWatchlist',
        'user.profilePic',
        'user.profilePicThumbnail',
      ])
      .where('user.role =:patient', { patient: Role.PATIENT })
      .innerJoinAndMapOne(
        'user.patientSupervisors',
        PatientSupervisionMapping,
        'patientSupervisors',
        ' patientSupervisors.userId =:userId AND patientSupervisors.patientId = user.id',
      )
      .leftJoin(
        'user.patientMedicalRisk',
        'patientMedicalRisk',
        'patientMedicalRisk.updatedAt >= :medicalRiskExpiredAt',
        { medicalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoin('user.patientInfo', 'patientInfo')
      .addSelect(['patientInfo.id', 'patientInfo.patientId'])
      .leftJoin('patientInfo.gateways', 'gateways')
      .leftJoin('user.organization', 'organization')
      .addSelect(['organization.id', 'organization.name', 'organization.type'])
      .setParameters({
        userId: options.userId,
      })
      .skip(options.skip)
      .take(options.limit);
    if (options.search) {
      query.andWhere(
        "((user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :search) OR (user.username ILIKE :search) OR (user.phoneNumber ILIKE :search))",
        {
          search: `%${options.search}%`,
        },
      );
    }
    if (options.isOnWatchlist !== undefined) {
      query.andWhere('user.isOnWatchlist =:isOnWatchlist', {
        isOnWatchlist: options.isOnWatchlist,
      });
    }
    if (options.fields) {
      this.applySortFilters(query, options);
      // options.fields.forEach((field, index) => {
      //   const sort =
      //     options.sorts && options.sorts[index] ? options.sorts[index] : 'DESC';
      //   if (field === 'patientMedicalRisk') {
      //     query
      //       .addSelect(
      //         `
      //           (
      //             CASE
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.RED}' THEN 1
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.AMBER}' THEN 2
      //               WHEN  patientMedicalRisk.risk_level = '${RiskLevel.GREEN}' THEN 3
      //               WHEN  patientMedicalRisk.risk_level IS NULL THEN 4
      //               ELSE 4
      //             END
      //           )
      //         `,
      //         'risk_value',
      //       )
      //       .addOrderBy('risk_value', sort);
      //   } else if (field === 'lastConnectionTime') {
      //     query.addOrderBy('sensors.lastConnectionTime', sort, 'NULLS LAST');
      //     query.addOrderBy('gateways.lastConnectionTime', sort, 'NULLS LAST');
      //   } else if (field === 'registering') {
      //     query.addOrderBy('sensors.isRegistered', sort, 'NULLS LAST');
      //   } else if (field === 'unregistering') {
      //     query.addOrderBy('sensors.unassignRequest', sort, 'NULLS LAST');
      //   } else {
      //     query.addOrderBy(`user.${field}`, sort, 'NULLS LAST');
      //   }
      // });
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async getPatientListWithCareteam(filters: IFindPatientListWithCareteam) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.organizationId',
        'user.chatId',
      ])
      .where('user.role =:patient', { patient: Role.PATIENT })
      .andWhere('user.organizationId =:organizationId', {
        organizationId: filters.organizationId,
      })
      .leftJoinAndSelect(
        'user.patientSupervisors',
        'patientSupervisors',
        'patientSupervisors.patientId = user.id',
      )
      .innerJoin('patientSupervisors.user', 'supervisor')
      .addSelect([
        'supervisor.id',
        'supervisor.username',
        'supervisor.firstName',
        'supervisor.middleName',
        'supervisor.lastName',
        'supervisor.role',
        'supervisor.profilePic',
        'supervisor.profilePicThumbnail',
        'supervisor.chatId',
      ])
      .skip(filters.skip)
      .take(filters.limit);
    if (filters.search) {
      query.andWhere(
        `(
          (
            user.firstName || 
            (
              CASE WHEN user.middleName IS NULL 
                THEN ' '  
                ELSE ' ' || user.middleName || ' ' 
                END 
            ) || 
            user.lastName ILIKE :search
          ) OR 
          (
            user.username ILIKE :search
          ) OR 
          (
            user.phoneNumber ILIKE :search
          ) OR
          (
            (
              supervisor.firstName || 
              (
                CASE WHEN supervisor.middleName IS NULL 
                  THEN ' '  
                  ELSE ' ' || supervisor.middleName || ' ' 
                  END 
              ) || 
              supervisor.lastName ILIKE :search
            )
          ) OR
          (
            supervisor.username ILIKE :search
          )
        )`,
        {
          search: `%${filters.search}%`,
        },
      );
    }
    if (filters.sortUserId) {
      query
        .addSelect(
          `
              (
                CASE
                  WHEN  supervisor.id = :sortUserId THEN 1
                  ELSE 2
                END
              )
            `,
          'user_sort',
        )
        .setParameter('sortUserId', filters.sortUserId)
        .addOrderBy('user_sort', 'ASC');
    }
    query.addOrderBy('user.firstName', 'ASC');
    query.addOrderBy('user.middleName', 'ASC');
    query.addOrderBy('user.lastName', 'ASC');
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async findPublicDoctorsListPaginated(options: IFindUserOptions) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('role = :role', { role: Role.DOCTOR })
      .leftJoin('user.doctorInfo', 'doctorInfo')
      .leftJoin('user.organization', 'organization')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.organizationId',
        'doctorInfo.specialization',
        'organization.id',
        'organization.name',
        'organization.address',
      ])
      .offset(options.skip)
      .limit(options.limit);
    if (options.organizationId) {
      query.andWhere('user.organizationId = :organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.search) {
      query.andWhere(
        "(user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :fullName)",
        {
          fullName: `%${options.search}%`,
        },
      );
    }
    const [data, count] = await query.getManyAndCount();
    return { data, totalCount: count };
  }

  async findOne(id: string, role?: Role): Promise<User> {
    const query = { id };
    if (role) {
      query['role'] = role;
    }
    return await this.usersRepository.findOne({
      where: query,
      relations: [
        'patientInfo',
        'doctorInfo',
        'caretakersPatient',
        'organization',
      ],
    });
  }

  async findOneUser(id: string, role?: Role): Promise<User> {
    const query = { id };
    if (role) {
      query['role'] = role;
    }
    return await this.usersRepository.findOne({
      where: query,
    });
  }

  async findOnePatientDetails(id: string): Promise<User> {
    const patientDetails = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('user.patientSupervisors', 'patientSupervisors')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .where('user.id =:id AND user.role =:patientRole', {
        id: id,
        patientRole: Role.PATIENT,
      })
      .getOne();
    if (!patientDetails) {
      throw new Error('Invalid patient Id');
    }
    return patientDetails;
  }

  async findOneById(id: string, role?: Role): Promise<User> {
    const query = { id };
    if (role) {
      query['role'] = role;
    }
    return await this.usersRepository.findOne({
      where: query,
      relations: [
        'patientInfo',
        'doctorInfo',
        'caretakersPatient',
        'organization',
      ],
    });
  }

  async findOneUserById(id: string, role?: Role): Promise<User> {
    const query = { id };
    if (role) {
      query['role'] = role;
    }
    return await this.usersRepository.findOne({
      where: query,
    });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findByIds(ids: string[], rolesFilter?: Role[]): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids });
    if (rolesFilter) {
      query.andWhere('user.role IN (:...rolesFilter)', { rolesFilter });
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async findOneByUsername(
    username: string,
    filter: IUserFilter = {},
  ): Promise<User> {
    // const query = { username };
    // if (roleFilter) {
    //   query['role'] = roleFilter;
    // }
    // return await this.usersRepository.findOne(query, {
    //   relations: [
    //     'patientInfo',
    //     'doctorInfo',
    //     'caretakersPatient',
    //     'organization',
    //   ],
    // });
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .leftJoinAndSelect('user.doctorInfo', 'doctorInfo')
      .leftJoinAndSelect('user.caretakersPatient', 'caretakersPatient')
      .leftJoinAndSelect('user.organization', 'organization');
    if (filter.role) {
      query.andWhere('user.role =:role', { role: filter.role });
    }
    if (filter.organizationId) {
      query.andWhere('user.organizationId =:organizationId', {
        organizationId: filter.organizationId,
      });
    }
    return await query.getOne().catch((err) => {
      throw err;
    });
  }

  async findOneDetails(id: string): Promise<User> {
    const query = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .leftJoinAndSelect('user.doctorInfo', 'doctorInfo')
      .leftJoinAndSelect('user.patientCaretakers', 'patientCaretakers')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect(
        'organization.organizationSettings',
        'organizationSettings',
      )
      .leftJoinAndSelect('patientCaretakers.caretaker', 'caretaker')
      .leftJoinAndSelect('user.caretakersPatient', 'caretakersPatient')
      .leftJoinAndSelect('caretakersPatient.patient', 'patientData')
      .leftJoinAndSelect('patientData.patientInfo', 'patientInfoDetails')
      .leftJoinAndSelect('patientInfoDetails.gateways', 'patientInfoGateways')
      .leftJoinAndSelect('patientInfoDetails.sensors', 'patientInfoSensors')
      .leftJoinAndSelect('user.patientSupervisors', 'patientSupervisors')
      .leftJoinAndSelect('patientSupervisors.user', 'supervisor')
      .leftJoinAndSelect('supervisor.doctorInfo', 'supervisorInfo')
      .leftJoinAndSelect('user.assignedPatients', 'assignedPatients')
      .leftJoinAndSelect('assignedPatients.patient', 'patient')
      .leftJoinAndSelect(
        'user.patientVitalRisks',
        'patientVitalRisks',
        'patientVitalRisks.updatedAt >= :vitalRiskExpiredAt',
        { vitalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .leftJoinAndSelect('patientVitalRisks.vitalSign', 'vitalSign')
      .leftJoinAndSelect(
        'user.patientMedicalRisk',
        'patientMedicalRisk',
        'patientMedicalRisk.updatedAt >= :medicalRiskExpiredAt',
        { medicalRiskExpiredAt: subtractDays(1, new Date()) },
      )
      .loadRelationCountAndMap(
        'user.unacknowledgedNotifications',
        'user.userNotificationUser',
        'userNotificationUser',
        (qb) =>
          qb.where(
            'userNotificationUser.acknowledgeRequired = true AND userNotificationUser.isAcknowledged = false',
          ),
      )
      .where('user.id =:user_id')
      .setParameter('user_id', id)
      .getOne();
    return query;
  }

  async findOneForDelete(id: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.patientInfo', 'patientInfo')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .where('user.id =:id', { id })
      .getOne();
  }

  async getDeletedUser(id: string): Promise<User> {
    const query = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.organizationId',
        'user.createdAt',
        'user.deletedAt',
      ])
      .where('user.id =:user_id')
      .setParameter('user_id', id)
      .withDeleted()
      .getOne();
    return query;
  }

  async findUserPasswordByUsername(username: string): Promise<User> {
    // return await this.usersRepository.findOne(
    //   { username: username },
    //   { select: ['id', 'password'] },
    // );
    return await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.password'])
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }

  async findUserLoginInfoByUsername(username: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.email',
        'user.phoneNumber',
        'user.password',
        'user.loginFailedCount',
        'user.isBlocked',
        'user.blockedAt',
      ])
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }

  async findUserPasswordById(id: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.password'])
      .where('id =:id', { id })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async getPatientsSupervisors(
    userIds: string[],
    excludeSupervisor?: string,
  ): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
      ])
      .innerJoin('user.assignedPatients', 'assignedPatient')
      .andWhere('assignedPatient.patientId IN (:...patientIds)', {
        patientIds: userIds,
      })
      .addSelect(['assignedPatient.isIncharge', 'assignedPatient.patientId'])
      .leftJoin('assignedPatient.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.role',
        'patient.profilePic',
        'patient.profilePicThumbnail',
        'patient.username',
      ]);
    if (excludeSupervisor) {
      query.andWhere('user.id <> :excludeSupervisor', { excludeSupervisor });
    }
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getPatientSupervisors(
    userId: string,
    options: IChatUsersPaginateOptions,
  ): Promise<{ data: User[]; totalCount: number }> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
        'user.chatId',
      ])
      .innerJoin('user.assignedPatients', 'assignedPatient')
      .andWhere('assignedPatient.patientId = :patientId', {
        patientId: userId,
      })
      .addSelect(['assignedPatient.isIncharge']);
    if (options.search) {
      query.andWhere(
        "(user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :fullName)",
        {
          fullName: `%${options.search}%`,
        },
      );
    }
    if (options.organizationId) {
      query.andWhere('user.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    query.orderBy('user.firstName').offset(options.skip).limit(options.limit);
    const [data, count] = await query.getManyAndCount().catch((err) => {
      throw err;
    });
    return { data, totalCount: count };
  }

  async getPatientCareTeam(
    patientId: string,
    options: IPatientCareTeamFilter,
  ): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
        'user.chatId',
      ])
      .innerJoin('user.assignedPatients', 'assignedPatient')
      .andWhere('assignedPatient.patientId = :patientId', {
        patientId,
      })
      .addSelect(['assignedPatient.isIncharge']);
    if (options.roles && options.roles.length > 0) {
      query.andWhere('user.role IN (:...roles)', { roles: options.roles });
    }
    if (options.excludeUserIds && options.excludeUserIds.length > 0) {
      query.andWhere('user.id NOT IN (:...excludeUserIds)', {
        excludeUserIds: options.excludeUserIds,
      });
    }
    if (options.search) {
      query.andWhere(
        "((user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :search) OR (user.username ILIKE :search) OR (user.phoneNumber ILIKE :search))",
        {
          search: `%${options.search}%`,
        },
      );
    }
    if (options.search) {
      query.andWhere(
        "(user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :fullName)",
        {
          fullName: `%${options.search}%`,
        },
      );
    }
    query.orderBy('user.firstName');
    return await query.getMany().catch((err) => {
      throw err;
    });
  }

  async getAdminChatUsers(
    userId: string,
    options: IChatUsersPaginateOptions,
  ): Promise<{ data: User[]; totalCount: number }> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
        'user.chatId',
      ])
      .leftJoin('user.organization', 'organization')
      .addSelect(['organization.id', 'organization.name', 'organization.type'])
      .andWhere('user.role NOT IN(:...adminExcludeRoles)', {
        adminExcludeRoles: [Role.PATIENT, Role.CARETAKER],
      });
    if (options.search) {
      query.andWhere(
        "(user.firstName || ( CASE WHEN user.middleName IS NULL THEN ' '  ELSE ' ' || user.middleName || ' ' END ) || user.lastName ILIKE :fullName)",
        {
          fullName: `%${options.search}%`,
        },
      );
    }
    if (options.organizationId) {
      query.andWhere('user.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    query.orderBy('user.firstName').offset(options.skip).limit(options.limit);
    const [data, count] = await query.getManyAndCount().catch((err) => {
      throw err;
    });
    return { data, totalCount: count };
  }

  async getPatientCaretakers(userIds: string[]): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
      ])
      .innerJoin('user.caretakersPatient', 'caretakersPatient')
      .andWhere('caretakersPatient.patientId IN (:...patientIds)', {
        patientIds: userIds,
      })
      .addSelect([
        'caretakersPatient.relationship',
        'caretakersPatient.patientId',
      ])
      .leftJoin('caretakersPatient.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.role',
        'patient.profilePic',
        'patient.profilePicThumbnail',
        'patient.username',
      ])
      .getMany()
      .catch((err) => {
        throw err;
      });
  }

  async getSupervisorPatients(userId: string): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.username',
        'user.gender',
        'user.chatId',
      ])
      .innerJoin('user.patientSupervisors', 'patientSupervisor')
      .andWhere('patientSupervisor.userId = :userId', {
        userId,
      })
      .addSelect(['patientSupervisor.isIncharge'])
      .getMany()
      .catch((err) => {
        throw err;
      });
  }

  async getSupervisorChatUsers(
    userId: string,
    options: IChatUsersPaginateOptions,
  ): Promise<{ data: User[]; totalCount: number }> {
    try {
      const sqlParams = [userId];
      if (options.organizationId) {
        sqlParams.push(options.organizationId);
      }
      if (options.search) {
        sqlParams.push(`%${options.search}%`);
      }
      const { listQuery, countQuery } = ChatUserListPaginateSQL(options);
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

  async getAllPatientsAndAlertSettings(): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.username',
        'user.role',
        'user.createdAt',
      ])
      .leftJoinAndSelect('user.patientAlertSettings', 'patientAlertSettings')
      .where('user.role = :role', { role: Role.PATIENT })
      .getMany();
  }

  async getAllPatientsAndTheirVitalSignsSettings(
    organizationId?: string,
  ): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.username',
        'user.email',
        'user.role',
        'user.organizationId',
        'user.createdAt',
      ])
      .where('user.role =:patientRole', { patientRole: Role.PATIENT })
      .leftJoin('user.patientInfo', 'patientInfo')
      .addSelect([
        'patientInfo.id',
        'patientInfo.patientId',
        'patientInfo.patientIdString',
      ])
      .leftJoinAndSelect('user.vitalSignsSettings', 'vitalSignsSettings');
    if (organizationId) {
      query.andWhere('user.organizationId =:organizationId', {
        organizationId,
      });
    }
    return await query.getMany();
  }

  async validateAndGetPatientByUserId(id: string): Promise<User> {
    const patient = await this.usersRepository.findOne(
      {
        id,
        role: Role.PATIENT,
      },
      {
        relations: ['patientInfo'],
      },
    );
    if (!patient) throw new Error('Invalid patient');
    return patient;
  }

  async updateLoginFailure(userId: string, isBlocked?: boolean) {
    const updateData = {};
    if (isBlocked) {
      updateData['isBlocked'] = true;
      updateData['blockedAt'] = new Date();
    }
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ loginFailedCount: () => 'login_failed_count + 1', ...updateData })
      .where('id =:userId', { userId })
      .execute()
      .catch((err) => {
        this.logService.logError('Failed to udpate login failure count', err);
      });
  }

  async clearLoginFailure(userId: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ loginFailedCount: 0, isBlocked: false })
      .where('id =:userId', { userId })
      .execute();
  }

  async resetBlockedUserAccount(userId: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ loginFailedCount: 0, isBlocked: false, accountResetToken: null })
      .where('id =:userId', { userId })
      .execute();
  }

  async updateUserBlockToken(userId: string, token: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ accountResetToken: token })
      .where('id =:userId', { userId })
      .execute();
  }

  async updateUserTemperoryToken(userId: string, token: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ temperoryToken: token })
      .where('id =:userId', { userId })
      .execute();
  }

  async updateUserEmailVerificationToken(userId: string, token: string) {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ emailVerificationToken: token })
      .where('id =:userId', { userId })
      .execute();
  }

  async verifyEmailAndAcceptTAndC(token: string, password?: string) {
    try {
      const updateDto = {
        isEmailVerified: true,
        isTAndCAccepted: true,
        emailVerificationToken: null,
        temperoryToken: null,
      };
      if (password) {
        updateDto['password'] = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      }
      return await this.usersRepository
        .createQueryBuilder()
        .update()
        .set(updateDto)
        .where('emailVerificationToken =:token', { token })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async getUserByAccountResetToken(token: string) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.profilePicThumbnail',
      ])
      .where('user.accountResetToken =:token', { token })
      .getOne();
  }

  async getUserByTemperoryToken(token: string) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.temperoryToken =:token', { token })
      .getOne();
  }

  async getUserByEmailVerificationToken(token: string) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.isEmailVerified',
        'user.isClinicalTrialUser',
        'user.isTAndCAccepted',
      ])
      .where('user.emailVerificationToken =:token', { token })
      .getOne();
  }
}
