import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationVitalSigns } from './entity/organization_vital_signs.entity';
import { OrganizationVitalSignsView } from './entity/organization_vital_signs.view.entity';
import { PatientVitalSigns } from './entity/patient_vital_signs.entity';
import { PatientVitalSignsView } from './entity/patient_vital_signs.view.entity';
import { VitalSignsMaster } from './entity/vital_signs_master.entity';
import {
  IPatientVitalVitalSignsObject,
  IUpdateVitalSign,
  IVitalSigns,
  IVitalSignsObject,
} from './interfaces/';

@Injectable()
export class VitalSignsModelService {
  constructor(
    @InjectRepository(VitalSignsMaster)
    private vitalSignsMasterRepository: Repository<VitalSignsMaster>,
    @InjectRepository(OrganizationVitalSigns)
    private organizationVitalSignsRepository: Repository<OrganizationVitalSigns>,
    @InjectRepository(OrganizationVitalSignsView)
    private organizationVitalSignsViewRepository: Repository<OrganizationVitalSignsView>,
    @InjectRepository(PatientVitalSigns)
    private patientVitalSignsRepository: Repository<PatientVitalSigns>,
    @InjectRepository(PatientVitalSignsView)
    private patientVitalSignsViewRepository: Repository<PatientVitalSignsView>,
  ) {}

  async getOrganizationVitalSigns(
    organizationId: string,
    isMedicalEngineAlert?: boolean,
  ): Promise<OrganizationVitalSignsView[]> {
    return await this.organizationVitalSignsViewRepository.find({
      where: {
        organizationId,
        isMedicalEngineAlert: isMedicalEngineAlert
          ? isMedicalEngineAlert
          : false,
      },
      order: { order: 'ASC' },
    });
  }

  async getPatientVitalSigns(
    patientId: string,
  ): Promise<PatientVitalSignsView[]> {
    return await this.patientVitalSignsViewRepository.find({
      patientId,
    });
  }

  async getAllVitalSigns(): Promise<VitalSignsMaster[]> {
    return await this.vitalSignsMasterRepository.find();
  }

  async getAllVitalSignsObject(): Promise<IVitalSignsObject> {
    const vitalsArray = await this.vitalSignsMasterRepository.find();
    return this.convertVitalsArrayToObject(vitalsArray);
  }

  async getOrganizationVitalSignsObject(
    organizationId: string,
  ): Promise<IVitalSignsObject> {
    const vitalSignsArray = await this.organizationVitalSignsViewRepository.find(
      {
        organizationId,
      },
    );
    const vitalSignsObject = {};
    vitalSignsArray.forEach((vitalSign) => {
      vitalSignsObject[vitalSign.key] = vitalSign;
    });
    return vitalSignsObject;
  }

  async getPatientVitalSignsObject(
    patientId: string,
  ): Promise<IPatientVitalVitalSignsObject> {
    const vitalSignsArray = await this.patientVitalSignsViewRepository.find({
      where: { patientId },
      order: { order: 'ASC' },
    });
    const vitalSignsObject = {};
    vitalSignsArray.forEach((vitalSign) => {
      vitalSignsObject[vitalSign.key] = vitalSign;
    });
    return vitalSignsObject;
  }

  private convertVitalsArrayToObject(
    vitalsArray: IVitalSigns[],
  ): IVitalSignsObject {
    const vitalSignsObject = {};
    vitalsArray.forEach((vitalSign) => {
      vitalSignsObject[vitalSign.key] = vitalSign;
    });
    return vitalSignsObject;
  }

  async updateOrganizationVitalSign(
    vitalSignId: string,
    organizationId: string,
    updateDto: IUpdateVitalSign,
  ) {
    return await this.organizationVitalSignsRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateDto })
      .where(
        'vitalSignId = :vitalSignId AND organizationId = :organizationId',
        { vitalSignId, organizationId },
      )
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async deleteAllPatientVitals(patientId: string) {
    return await this.patientVitalSignsRepository
      .createQueryBuilder()
      .delete()
      .where('patientId = :patientId', { patientId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async deleteAllOrganizationVitals(organizationId: string) {
    return await this.organizationVitalSignsRepository
      .createQueryBuilder()
      .delete()
      .where('organizationId = :organizationId', { organizationId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async createOrUpdateOrganizationVitalSign(
    vitalSignId: string,
    organizationId: string,
    updateDto: IUpdateVitalSign,
  ) {
    try {
      const orgVitals = await this.organizationVitalSignsRepository.findOne({
        vitalSignId,
        organizationId,
      });
      if (orgVitals) {
        return await this.organizationVitalSignsRepository.save({
          ...orgVitals,
          ...updateDto,
        });
      } else {
        return await this.organizationVitalSignsRepository.save({
          vitalSignId,
          organizationId,
          ...updateDto,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdatePatientVitalSign(
    vitalSignId: string,
    patientId: string,
    updateDto: IUpdateVitalSign,
  ) {
    try {
      const patientVitals = await this.patientVitalSignsRepository.findOne({
        vitalSignId,
        patientId,
      });
      if (patientVitals) {
        return await this.patientVitalSignsRepository.save({
          ...patientVitals,
          ...updateDto,
        });
      } else {
        return await this.patientVitalSignsRepository.save({
          vitalSignId,
          patientId,
          ...updateDto,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
