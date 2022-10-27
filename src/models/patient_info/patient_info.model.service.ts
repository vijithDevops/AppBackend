import { Role } from './../user/entity/user.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogService } from 'src/services/logger/logger.service';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { PatientInfo } from './entity/patient_info.entity';
import { ICreatePatientInfo, IUpdatePatientInfo } from './interfaces';
import { getUniqueArrayNumberValues } from 'src/common/utils/helpers';

@Injectable()
export class PatientInfoModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(PatientInfo)
    private patientInfoRepository: Repository<PatientInfo>,
  ) {}

  async createPatientInfo(
    createPatientInfo: ICreatePatientInfo,
  ): Promise<PatientInfo> {
    return await this.patientInfoRepository.save(createPatientInfo);
  }

  async updatePatientInfo(
    patientId: string,
    updatePatientInfo: IUpdatePatientInfo,
  ) {
    return await this.patientInfoRepository
      .createQueryBuilder()
      .update()
      .set({ ...updatePatientInfo })
      .where('userId = :patientId', { patientId })
      .execute()
      .catch((err) => {
        this.logService.logError('Error updating patient info', err);
      });
  }

  async getAllActivePatientIds(): Promise<number[]> {
    const patients = await this.patientInfoRepository
      .createQueryBuilder('patientInfo')
      .addSelect(['patientInfo.patientId'])
      .innerJoin('patientInfo.patient', 'patient')
      .orderBy('patientInfo.patientId', 'ASC')
      .getMany();
    return patients.map((patient) => {
      return patient.patientId;
    });
  }

  async getPatientInfoByIntId(patientIdInt: number): Promise<PatientInfo> {
    return await this.patientInfoRepository
      .createQueryBuilder('patientInfo')
      .leftJoin('patientInfo.patient', 'patient')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.middleName',
        'patient.lastName',
        'patient.username',
        'patient.role',
        'patient.email',
        'patient.createdAt',
        'patient.updatedAt',
      ])
      .where('patientInfo.patientId = :patientIdInt', { patientIdInt })
      .getOne();
  }

  async validatePatientIntIdsAndGetUserIds(
    patientIntIds: number[],
    organizationId?: string,
    validateOrganizationFilter?: boolean,
  ): Promise<string[]> {
    try {
      const uniqueIds = getUniqueArrayNumberValues(patientIntIds);
      const query = await this.patientInfoRepository
        .createQueryBuilder('patientInfo')
        .select([
          'patientInfo.id',
          'patientInfo.patientId',
          'patientInfo.userId',
        ])
        .where('patientInfo.patientId IN (:...patientIds)', {
          patientIds: uniqueIds,
        })
        .innerJoin(
          'patientInfo.patient',
          'patient',
          'patient.role =:patientRole',
          { patientRole: Role.PATIENT },
        )
        .addSelect([
          'patient.id',
          'patient.firstName',
          'patient.middleName',
          'patient.lastName',
          'patient.role',
          'patient.organizationId',
        ]);
      if (organizationId && validateOrganizationFilter) {
        query.andWhere('patient.organizationId =:organizationId', {
          organizationId,
        });
      }
      const patientInfos = await query.getMany();
      if (patientInfos.length !== uniqueIds.length) {
        throw new Error('Invalid patient found');
      }
      const finalUserIds = [];
      patientInfos.forEach((patientInfo) => {
        if (organizationId) {
          if (patientInfo.patient.organizationId === organizationId) {
            finalUserIds.push(patientInfo.userId);
          }
        } else {
          finalUserIds.push(patientInfo.userId);
        }
      });
      return finalUserIds;
    } catch (error) {
      throw error;
    }
  }

  async getPatientDevicesByUserId(userId: string): Promise<PatientInfo> {
    return await this.patientInfoRepository
      .createQueryBuilder('patientInfo')
      .leftJoinAndSelect('patientInfo.sensors', 'sensors')
      .leftJoinAndSelect('patientInfo.gateways', 'gateways')
      .where('patientInfo.userId = :userId', { userId })
      .getOne();
  }

  async findPatientInfoByUserId(userId: string): Promise<PatientInfo> {
    return await this.patientInfoRepository.findOne({
      userId: userId,
    });
  }

  async findPatientInfoByPatientIdInt(patientId: number): Promise<PatientInfo> {
    return await this.patientInfoRepository.findOne({ patientId: patientId });
  }

  async findPatientByPatientIdInt(patientId: number): Promise<User> {
    const patientInfo = await this.patientInfoRepository.findOne({
      where: { patientId: patientId },
      relations: ['patient'],
    });
    if (patientInfo && patientInfo.patient) {
      return patientInfo.patient;
    } else {
      throw new Error('Invalid patientId Integer');
    }
  }
}
