import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './entity/sensor.entity';
import {
  ICreateSensor,
  IFindAllSensors,
  IFindAvailableSensor,
  IUpdateSensor,
  IUpdateSensorInfo,
} from './interfaces';
import { LogService } from '../../services/logger/logger.service';
import {
  DeviceConnectionMode,
  SensorProcessState,
  SensorProcessStateStatus,
} from './entity/sensor.enum';

@Injectable()
export class SensorModelService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    private logService: LogService,
  ) {}

  async create(createSensor: ICreateSensor): Promise<Sensor> {
    return await this.sensorRepository.save(createSensor);
  }

  async update(updateSensor: IUpdateSensor): Promise<Sensor> {
    return await this.sensorRepository.save(updateSensor);
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorRepository.find();
  }

  async findOne(id: string): Promise<Sensor> {
    return await this.sensorRepository.findOne(id);
  }

  async findOneDetails(id: string): Promise<Sensor> {
    return await this.sensorRepository.findOne({
      where: { id },
      relations: ['gateway', 'patient', 'organization'],
    });
  }

  async findOneByModel(name: string, macId: string): Promise<Sensor> {
    return await this.sensorRepository.findOne({
      where: { name, macId },
      relations: ['gateway', 'patient', 'organization'],
    });
  }

  async findOneByMacId(macId: string): Promise<Sensor> {
    // return await this.sensorRepository.findOne({ macId: macId });
    return await this.sensorRepository
      .createQueryBuilder('sensor')
      .where('LOWER(sensor.macId) = LOWER(:macId)', { macId })
      .getOne()
      .catch((err) => {
        throw err;
      });
  }

  async getPatientSensor(
    patientId: number,
    filterOption?: { connectionMode?: DeviceConnectionMode },
  ): Promise<Sensor> {
    return await this.sensorRepository.findOne({ patientId, ...filterOption });
  }

  async validateAndGetSensorByMacId(
    macId: string,
    organizationId?: string,
  ): Promise<Sensor> {
    const query = {
      macId,
    };
    if (organizationId) {
      query['organizationId'] = organizationId;
    }
    const sensor = await this.sensorRepository.findOne(query);
    if (!sensor) {
      throw new Error('Invalid sensor');
    }
    return sensor;
  }

  async findOneDetailsByMacId(macId: string): Promise<Sensor> {
    return await this.sensorRepository.findOne({
      where: { macId: macId },
      relations: ['gateway'],
    });
  }

  async findOneByName(
    name: string,
    options?: { organizationId?: string },
  ): Promise<Sensor> {
    return await this.sensorRepository.findOne({
      where: { name, ...options },
      relations: ['gateway', 'patient', 'organization'],
    });
  }

  async findByPatientId(patientIdInt: number): Promise<Sensor[]> {
    return await this.sensorRepository.find({
      where: { patientId: patientIdInt },
      relations: ['gateway'],
    });
  }

  async findAllAvailableSensors() {
    const query = this.sensorRepository
      .createQueryBuilder('sensor')
      .where({ isAvailable: true });

    const [data, count] = await query.getManyAndCount();
    return { data: data, totalCount: count };
  }

  async findAvailableSensorsPaginated(options: IFindAvailableSensor) {
    const query = this.sensorRepository
      .createQueryBuilder('sensor')
      .leftJoin('sensor.organization', 'organization')
      .addSelect(['organization.id', 'organization.name'])
      .where({ isAvailable: true })
      .addOrderBy('sensor.createdAt', options.sort)
      .offset(options.skip)
      .limit(options.limit);
    if (options.organizationId) {
      query.andWhere('sensor.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.search) {
      query.andWhere(
        'sensor.name ILIKE :search OR sensor.macId ILIKE :search',
        {
          search: `%${options.search}%`,
        },
      );
    }
    const [data, count] = await query.getManyAndCount();
    return { data: data, totalCount: count };
  }

  async findOneBySensorAndPatientIdInt(
    sensorId: string,
    patientIdInt: number,
  ): Promise<Sensor> {
    return await this.sensorRepository.findOne({
      id: sensorId,
      patientId: patientIdInt,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.sensorRepository.softDelete(id);
  }

  async delete(id: string): Promise<void> {
    await this.sensorRepository.delete(id);
  }

  async findAllSensorsPaginated(options: IFindAllSensors) {
    const query = this.sensorRepository
      .createQueryBuilder('sensor')
      .leftJoin('sensor.patient', 'patientInfo')
      .addSelect(['patientInfo.userId', 'patientInfo.patientId'])
      .leftJoin('patientInfo.patient', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.firstName',
        'user.middleName',
        'user.lastName',
      ])
      .leftJoin('sensor.organization', 'organization')
      .addSelect(['organization.id', 'organization.name'])
      .offset(options.skip)
      .limit(options.limit);
    const countQuery = this.sensorRepository.createQueryBuilder('sensor');
    if (options.patientIdInt) {
      query.andWhere('sensor.patientId =:patientIdInt', {
        patientIdInt: options.patientIdInt,
      });
      countQuery.where('sensor.patientId =:patientIdInt', {
        patientIdInt: options.patientIdInt,
      });
    }
    if (options.organizationId) {
      query.andWhere('sensor.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
      countQuery.andWhere('sensor.organizationId =:organizationId', {
        organizationId: options.organizationId,
      });
    }
    if (options.isActive) {
      query.where('sensor.isActive =:isActive', { isActive: options.isActive });
      countQuery.where('sensor.isActive =:isActive', {
        isActive: options.isActive,
      });
    }
    if (options.search) {
      query.andWhere(
        '(sensor.name ILIKE :search OR sensor.macId ILIKE :search)',
        {
          search: `%${options.search}%`,
        },
      );
      countQuery.andWhere(
        '(sensor.name ILIKE :search OR sensor.macId ILIKE :search)',
        {
          search: `%${options.search}%`,
        },
      );
    }
    options.fields.forEach((field, index) => {
      const sort =
        options.sorts && options.sorts[index] ? options.sorts[index] : 'DESC';
      query.addOrderBy(`sensor.${field}`, sort, 'NULLS LAST');
    });
    const [data, count] = await Promise.all([
      query.getMany().catch((err) => {
        throw err;
      }),
      countQuery.getCount().catch((err) => {
        throw err;
      }),
    ]);
    return { data, totalCount: count };
  }

  async getSingleSensorDetails(sensorId: string): Promise<Sensor> {
    return await this.sensorRepository
      .createQueryBuilder('sensor')
      .where('sensor.id =:sensorId', { sensorId })
      .leftJoinAndSelect('sensor.gateway', 'gateway')
      .leftJoin('sensor.patient', 'patientInfo')
      .addSelect(['patientInfo.userId', 'patientInfo.patientId'])
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

  async updateSensorObject(sensor: Sensor) {
    await this.sensorRepository.save(sensor);
  }

  async updateSensorById(id: string, updateSensor: IUpdateSensorInfo) {
    return await this.sensorRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateSensor })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError(
          'Error updating Sensor info by updateSensorById',
          err,
        );
      });
  }

  async updateSensorsOnGatewayClearSensorSuccess(gatewayId: string) {
    return await this.sensorRepository
      .createQueryBuilder()
      .update()
      .set({
        gatewayId: null,
        lastProcessedState: SensorProcessState.CLEAR,
        processedStateStatus: SensorProcessStateStatus.SUCCESS,
        isPaired: false,
      })
      .where('gatewayId = :gatewayId', { gatewayId })
      .execute()
      .catch((err) => {
        this.logService.logError(
          'Error in updateSensorsOnGatewayClearSensorSuccess',
          err,
        );
      });
  }

  async updateSensorsOnGatewayClearSensorFailure(gatewayId: string) {
    return await this.sensorRepository
      .createQueryBuilder()
      .update()
      .set({
        lastProcessedState: SensorProcessState.CLEAR,
        processedStateStatus: SensorProcessStateStatus.FAILED,
      })
      .where('gatewayId = :gatewayId', { gatewayId })
      .execute()
      .catch((err) => {
        this.logService.logError(
          'Error in updateSensorsOnGatewayClearSensorFailure ',
          err,
        );
      });
  }
}
