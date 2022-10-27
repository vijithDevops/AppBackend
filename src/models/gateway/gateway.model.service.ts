import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gateway } from './entity/gateway.entity';
import {
  ICreateGateway,
  IUpdateGateway,
  IFindAllGateways,
  IUpdateGatewayInfo,
  IFindAvailableGateways,
} from './interfaces';
import { LogService } from '../../services/logger/logger.service';
import { GatewayType } from './entity/gateway.enum';
@Injectable()
export class GatewayModelService {
  constructor(
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    private logService: LogService,
  ) {}

  async create(
    createGateway: ICreateGateway,
    type?: GatewayType | GatewayType.GATEWAY,
  ): Promise<Gateway> {
    return await this.gatewayRepository.save({ ...createGateway, type });
  }

  async update(updateGateway: IUpdateGateway): Promise<Gateway> {
    return await this.gatewayRepository.save(updateGateway);
  }

  async findAll(): Promise<Gateway[]> {
    return await this.gatewayRepository.find();
  }

  async findOne(id: string): Promise<Gateway> {
    return await this.gatewayRepository.findOne(id);
  }

  async findOneDetails(id: string): Promise<Gateway> {
    return await this.gatewayRepository.findOne({
      where: { id },
      relations: ['sensors', 'patient', 'organization'],
    });
  }

  async findOneByModel(name: string, macId: string): Promise<Gateway> {
    return await this.gatewayRepository.findOne({
      where: { name, macId },
      relations: ['sensors', 'patient', 'organization'],
    });
  }

  async findOneByMacId(macId: string): Promise<Gateway> {
    return await this.gatewayRepository.findOne({ macId: macId });
  }

  async findOneDetailsByMacId(macId: string): Promise<Gateway> {
    return await this.gatewayRepository.findOne({
      where: { macId: macId },
      relations: ['sensors'],
    });
  }

  async findOneByName(
    name: string,
    options?: { organizationId?: string },
  ): Promise<Gateway> {
    return await this.gatewayRepository.findOne({
      where: { name, ...options },
      relations: ['sensors', 'patient', 'organization'],
    });
  }

  async findByPatientId(patientIdInt: number): Promise<Gateway[]> {
    return await this.gatewayRepository.find({
      where: { patientId: patientIdInt },
      relations: ['sensors'],
    });
  }

  async findOneByPatientId(patientIdInt: number): Promise<Gateway> {
    return await this.gatewayRepository.findOne({
      where: { patientId: patientIdInt },
      relations: ['sensors'],
    });
  }

  async findAllAvailableGateways() {
    const query = this.gatewayRepository
      .createQueryBuilder('gateway')
      .where({ isAvailable: true });

    const [data, count] = await query.getManyAndCount();
    return { data: data, totalCount: count };
  }

  async findAvailableGatewaysPaginated(options: IFindAvailableGateways) {
    const query = this.gatewayRepository
      .createQueryBuilder('gateway')
      .leftJoin('gateway.organization', 'organization')
      .addSelect(['organization.id', 'organization.name'])
      .where({ isAvailable: true })
      .addOrderBy('gateway.createdAt', options.sort)
      .offset(options.skip)
      .limit(options.limit);
    if (options.organizationId) {
      query.andWhere('gateway.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.search) {
      query.andWhere(
        'gateway.name ILIKE :search OR gateway.macId ILIKE :search',
        {
          search: `%${options.search}%`,
        },
      );
    }
    const [data, count] = await query.getManyAndCount();
    return { data: data, totalCount: count };
  }

  async findAllGatewaysPaginated(options: IFindAllGateways) {
    const query = this.gatewayRepository
      .createQueryBuilder('gateway')
      .leftJoinAndSelect('gateway.sensors', 'sensors')
      .leftJoin('gateway.patient', 'patientInfo')
      .addSelect(['patientInfo.userId'])
      .leftJoin('patientInfo.patient', 'user')
      .addSelect(['user.username'])
      .leftJoin('gateway.organization', 'organization')
      .addSelect(['organization.id', 'organization.name'])
      .offset(options.skip)
      .limit(options.limit);
    const countQuery = this.gatewayRepository.createQueryBuilder('gateway');
    if (options.patientIdInt) {
      query.andWhere('gateway.patientId =:patientIdInt', {
        patientIdInt: options.patientIdInt,
      });
      countQuery.andWhere('gateway.patientId =:patientIdInt', {
        patientIdInt: options.patientIdInt,
      });
    }
    if (options.organizationId) {
      query.andWhere('gateway.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
      countQuery.andWhere('gateway.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.isActive) {
      query.andWhere('gateway.isActive =:isActive', {
        isActive: options.isActive,
      });
      countQuery.andWhere('gateway.isActive =:isActive', {
        isActive: options.isActive,
      });
    }
    if (options.search) {
      query.andWhere(
        '(gateway.name ILIKE :search OR gateway.macId ILIKE :search)',
        {
          search: `%${options.search}%`,
        },
      );
      countQuery.andWhere(
        '(gateway.name ILIKE :search OR gateway.macId ILIKE :search)',
        {
          search: `%${options.search}%`,
        },
      );
    }
    options.fields.forEach((field, index) => {
      const sort =
        options.sorts && options.sorts[index] ? options.sorts[index] : 'DESC';
      query.addOrderBy(`gateway.${field}`, sort, 'NULLS LAST');
    });
    const [data, count] = await Promise.all([
      query.getMany(),
      countQuery.getCount(),
    ]).catch((err) => {
      throw err;
    });
    return { data: data, totalCount: count };
  }

  async getSingleGatewayDetails(gatewayId: string) {
    return await this.gatewayRepository
      .createQueryBuilder('gateway')
      .where('gateway.id =:gatewayId', { gatewayId })
      .leftJoinAndSelect('gateway.sensors', 'sensors')
      .leftJoin('gateway.patient', 'patientInfo')
      .addSelect(['patientInfo.userId'])
      .leftJoin('patientInfo.patient', 'user')
      .addSelect([
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
      .getOne()
      .catch((err) => {
        throw err;
      });
  }

  async getGatewayAndAssignedPatientByMacId(macId: string): Promise<Gateway> {
    const gateway = await this.gatewayRepository
      .createQueryBuilder('gateway')
      .where('gateway.macId =:macId', { macId })
      .leftJoin('gateway.patient', 'patientInfo')
      .addSelect(['patientInfo.patientId', 'patientInfo.userId'])
      .leftJoin('patientInfo.patient', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.username',
      ])
      .getOne();
    if (!gateway) {
      throw new Error('Invalid Gateway macId');
    }
    return gateway;
  }

  async findOneByGatewayAndPatientIdInt(
    gatewayId: string,
    patientIdInt: number,
  ): Promise<Gateway> {
    const gateway = await this.gatewayRepository.findOne({
      id: gatewayId,
      patientId: patientIdInt,
    });
    if (!gateway) {
      throw new Error('Invalid Gateway for patient');
    }
    return gateway;
  }

  async softDelete(id: string): Promise<void> {
    await this.gatewayRepository.softDelete(id);
  }

  async delete(id: string): Promise<void> {
    await this.gatewayRepository.delete(id);
  }

  async deleteByPatientId(patientId: number): Promise<void> {
    await this.gatewayRepository.delete({ patientId });
  }

  async updateGatewayObject(gateway: Gateway) {
    await this.gatewayRepository.save(gateway);
  }

  async updateGatewayById(id: string, updateGateway: IUpdateGatewayInfo) {
    return await this.gatewayRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateGateway })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating gateway info by id', err);
      });
  }
}
