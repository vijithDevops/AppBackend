import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogService } from 'src/services/logger/logger.service';
import { Repository } from 'typeorm';
import { Role } from '../user/entity/user.enum';
import { PatientSupervisionMapping } from './entity/patient_supervision_mapping.entity';
import { ICreatePatientSuperVisor, IUpdateDoctorInCharge } from './interfaces';

@Injectable()
export class PatientSupervisionMappingModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(PatientSupervisionMapping)
    private patientSupervisionMappingRepository: Repository<PatientSupervisionMapping>,
  ) {}

  async assignSupervisors(
    patientSuperVisor: ICreatePatientSuperVisor[],
  ): Promise<PatientSupervisionMapping[]> {
    return await this.patientSupervisionMappingRepository
      .save(patientSuperVisor)
      .catch((err) => {
        throw err;
      });
  }

  async findOneById(
    id: string,
    patientId?: string,
  ): Promise<PatientSupervisionMapping> {
    const query = { id };
    if (patientId) {
      query['patientId'] = patientId;
    }
    return await this.patientSupervisionMappingRepository
      .findOne({
        where: query,
        relations: ['user'],
      })
      .catch((err) => {
        throw err;
      });
  }

  async getInchargeCountOfPatient(
    patientId: string,
    excludeInchargeUserIds?: string[],
  ) {
    const query = this.patientSupervisionMappingRepository
      .createQueryBuilder('supervisionMapping')
      .where('supervisionMapping.patientId = :patientId', { patientId });
    if (excludeInchargeUserIds && excludeInchargeUserIds.length > 0) {
      query.andWhere(
        'supervisionMapping.userId NOT IN (:...excludeInchargeUserIds)',
        {
          excludeInchargeUserIds,
        },
      );
    }
    return await query.getCount().catch((err) => {
      this.logService.logError('Errro finding incharge count of patient', err);
    });
  }

  async getDoctorInCharge(
    patientId: string,
  ): Promise<PatientSupervisionMapping> {
    return await this.patientSupervisionMappingRepository.findOne({
      patientId,
      isIncharge: true,
    });
  }

  async getSuperVisorMapping(
    patientId: string,
    userId: string,
  ): Promise<PatientSupervisionMapping> {
    return await this.patientSupervisionMappingRepository.findOne({
      where: {
        patientId,
        userId,
      },
      relations: ['patient', 'user'],
    });
  }

  async deleteSupervisorMapping(id: string) {
    try {
      return await this.patientSupervisionMappingRepository
        .createQueryBuilder('mapping')
        .delete()
        .where('mapping.id = :id', { id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<PatientSupervisionMapping[]> {
    return await this.patientSupervisionMappingRepository.find({
      userId: userId,
    });
  }

  async findPatientSupervisors(
    patientId: string,
  ): Promise<PatientSupervisionMapping[]> {
    return await this.patientSupervisionMappingRepository.find({
      where: { patientId },
    });
  }

  async findPatientSupervisorsDetails(
    patientId: string,
  ): Promise<PatientSupervisionMapping[]> {
    // return await this.patientSupervisionMappingRepository.find({
    //   where: { patientId },
    //   relations: ['user'],
    // });
    return await this.patientSupervisionMappingRepository
      .createQueryBuilder('PatientSupervisionMapping')
      .andWhere('PatientSupervisionMapping.patientId =:patientId', {
        patientId,
      })
      .leftJoin('PatientSupervisionMapping.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.chatId',
      ])
      .getMany();
  }

  async getPatientsSupervisorsDetails(
    patientIds: string[],
  ): Promise<PatientSupervisionMapping[]> {
    return await this.patientSupervisionMappingRepository
      .createQueryBuilder('PatientSupervisionMapping')
      .andWhere('PatientSupervisionMapping.patientId IN (:...patientIds)', {
        patientIds,
      })
      .leftJoin('PatientSupervisionMapping.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.role',
        'user.profilePic',
        'user.profilePicThumbnail',
        'user.chatId',
      ])
      .getMany();
  }

  async deleteById(id: string): Promise<void> {
    await this.patientSupervisionMappingRepository.delete(id);
  }

  async updateDoctorInCharge(
    patientId: string,
    updateObject: IUpdateDoctorInCharge,
  ) {
    return await this.patientSupervisionMappingRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateObject })
      .where('patientId = :patientId', { patientId })
      .andWhere('isIncharge = true')
      .execute()
      .catch((err) => {
        this.logService.logError('Errro updating doctor incharge', err);
      });
  }

  async updateInchargeByMappingId(id: string, isIncharge: boolean) {
    return await this.patientSupervisionMappingRepository
      .createQueryBuilder()
      .update()
      .set({ isIncharge })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        this.logService.logError('Errro updating incharge by mapping id', err);
      });
  }

  async delete(id: string) {
    return await this.patientSupervisionMappingRepository.delete(id);
  }

  async getPatientCaretakersAndCliniciansId(
    patientId: string,
  ): Promise<{ caretakers: string[]; clinicians: string[] }> {
    const supervisors = await this.findPatientSupervisorsDetails(patientId);
    const caretakers = [];
    const clinicians = [];
    supervisors.forEach((supervisor) => {
      if (supervisor.user.role === Role.CARETAKER) {
        caretakers.push(supervisor.userId);
      } else {
        clinicians.push(supervisor.userId);
      }
    });
    return {
      caretakers,
      clinicians,
    };
  }

  async getPatientsSupervisorsId(
    patientIds: string[],
  ): Promise<{
    [key: string]: {
      caretakers: string[];
      incharge: string[];
      clinicians: string[];
    };
  }> {
    const supervisors = await this.getPatientsSupervisorsDetails(patientIds);
    const patientSupervisorsData = {};
    supervisors.forEach((supervisor) => {
      if (supervisor.user.role === Role.CARETAKER) {
        if (patientSupervisorsData[supervisor.patientId]) {
          patientSupervisorsData[supervisor.patientId]['caretakers'].push(
            supervisor.userId,
          );
        } else {
          patientSupervisorsData[supervisor.patientId] = {
            caretakers: [supervisor.userId],
            incharge: [],
            clinicians: [],
          };
          // patientSupervisorsData[supervisor.patientId]['caretakers'] = [
          //   supervisor.userId,
          // ];
        }
      } else if (supervisor.isIncharge) {
        if (patientSupervisorsData[supervisor.patientId]) {
          patientSupervisorsData[supervisor.patientId]['incharge'].push(
            supervisor.userId,
          );
        } else {
          patientSupervisorsData[supervisor.patientId] = {
            caretakers: [],
            incharge: [supervisor.userId],
            clinicians: [],
          };
          // patientSupervisorsData[supervisor.patientId]['incharge'] = [
          //   supervisor.userId,
          // ];
        }
      } else {
        if (patientSupervisorsData[supervisor.patientId]) {
          patientSupervisorsData[supervisor.patientId]['clinicians'].push(
            supervisor.userId,
          );
        } else {
          patientSupervisorsData[supervisor.patientId] = {
            caretakers: [],
            incharge: [],
            clinicians: [supervisor.userId],
          };
          // patientSupervisorsData[supervisor.patientId]['clinicians'] = [
          //   supervisor.userId,
          // ];
        }
      }
    });
    return patientSupervisorsData;
  }
}
