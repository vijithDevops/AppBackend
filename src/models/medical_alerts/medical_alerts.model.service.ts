import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalAlertNotificationSettings } from './entity/medical_alert_notification_settings.entity';
import { MedicalAlertSettings } from './entity/medical_alert_settings.entity';
import { PatientMedicalRisk } from './entity/patient_medical_risk.entity';
import { PatientVitalRisk } from './entity/patient_vital_risk.entity';
import {
  ICreatePatientMedicalRisk,
  IUpdateMedicalAlertsSettings,
  IUpdatePatientMedicalRisk,
  IUpdatePatientVitalRisk,
} from './interfaces';

@Injectable()
export class MedicalAlertModelService {
  constructor(
    @InjectRepository(MedicalAlertSettings)
    private medicalAlertSettingsRepository: Repository<MedicalAlertSettings>,
    @InjectRepository(MedicalAlertNotificationSettings)
    private medicalAlertNotificationSettingsRepository: Repository<MedicalAlertNotificationSettings>,
    @InjectRepository(PatientMedicalRisk)
    private patientMedicalRiskRepository: Repository<PatientMedicalRisk>,
    @InjectRepository(PatientVitalRisk)
    private patientVitalRiskRepository: Repository<PatientVitalRisk>,
  ) {}

  async findOneSettingsByOrganizationId(
    organizationId: string,
  ): Promise<MedicalAlertSettings> {
    const settings = await this.medicalAlertSettingsRepository.findOne({
      organizationId,
    });
    if (!settings) {
      return await this.createDefaultSettings({ organizationId });
    } else {
      return settings;
    }
  }

  async validateAndFindOneById(id: string): Promise<MedicalAlertSettings> {
    const settings = await this.medicalAlertSettingsRepository.findOne({
      id,
    });
    if (!settings) {
      throw new Error('Invalid Medical alert settings Id');
    } else {
      return settings;
    }
  }

  async findOneBySchedulerId(
    schedulerId: string,
  ): Promise<MedicalAlertSettings> {
    const settings = await this.medicalAlertSettingsRepository.findOne({
      schedulerId,
    });
    if (!settings) {
      throw new Error('Invalid Schedulet If for medical alerts');
    } else {
      return settings;
    }
  }

  async getPatientMedicalRisk(patientId: string): Promise<PatientMedicalRisk> {
    return await this.patientMedicalRiskRepository.findOne({
      patientId,
    });
  }

  async getPatientVitalRisk(patientId: string): Promise<PatientVitalRisk[]> {
    return await this.patientVitalRiskRepository.find({
      patientId,
    });
  }

  async isAnyPatientVitalRisk(patientId: string): Promise<boolean> {
    return !!(await this.patientVitalRiskRepository.count({
      patientId,
    }));
  }

  async createDefaultSettings(dto: {
    organizationId: string;
    isActive?: boolean;
  }): Promise<MedicalAlertSettings> {
    return await this.medicalAlertSettingsRepository.save(dto);
  }

  async deleteSettingsById(id: string) {
    try {
      return await this.medicalAlertSettingsRepository
        .createQueryBuilder('settings')
        .delete()
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  private async createPatientMedicalRisk(
    dto: ICreatePatientMedicalRisk,
  ): Promise<PatientMedicalRisk> {
    return await this.patientMedicalRiskRepository.save(dto).catch((err) => {
      throw err;
    });
  }

  async updateMedicalAlertSettingsById(
    id: string,
    updateDto: IUpdateMedicalAlertsSettings,
  ) {
    return await this.medicalAlertSettingsRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateDto })
      .where('id = :id', { id })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async updatePatientRiskacknowledgement(
    patientId: string,
    acknowledgeUserId: string,
  ) {
    return await this.patientMedicalRiskRepository
      .createQueryBuilder()
      .update()
      .set({
        acknowledgeRequired: false,
        lastAcknowledgedAt: new Date(),
        lastAcknowledgedBy: acknowledgeUserId,
      })
      .where('patientId = :patientId', { patientId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async updatePatientLastNotifiedTime(patientId: string) {
    return await this.patientMedicalRiskRepository
      .createQueryBuilder()
      .update()
      .set({ lastNotifiedAt: new Date() })
      .where('patientId = :patientId', { patientId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  private async updatePatientMedicalRisk(
    patientId: string,
    updateDto: IUpdatePatientMedicalRisk,
  ) {
    return await this.patientMedicalRiskRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateDto })
      .where('patientId = :patientId', { patientId })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async updateMedicalAlertNotificationTemplate(
    medicalAlertSettingsId: string,
    notificationEventId: string,
    template: string,
  ) {
    return await this.medicalAlertNotificationSettingsRepository
      .createQueryBuilder()
      .update()
      .set({ messageTemplate: template })
      .where(
        'medicalAlertSettingsId = :medicalAlertSettingsId AND notificationEventId = :notificationEventId',
        { medicalAlertSettingsId, notificationEventId },
      )
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async createOrUpdateMedicalAlertNotificationTemplate(
    medicalAlertSettingsId: string,
    notificationEventId: string,
    template: string,
  ) {
    try {
      const notificationSettings = await this.medicalAlertNotificationSettingsRepository.findOne(
        {
          medicalAlertSettingsId,
          notificationEventId,
        },
      );
      if (notificationSettings) {
        return await this.medicalAlertNotificationSettingsRepository.save({
          ...notificationSettings,
          messageTemplate: template,
        });
      } else {
        return await this.medicalAlertNotificationSettingsRepository.save({
          medicalAlertSettingsId,
          notificationEventId,
          messageTemplate: template,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteMedicalAlertNotificationTemplates(
    medicalAlertSettingsId: string,
  ) {
    return await this.medicalAlertNotificationSettingsRepository
      .createQueryBuilder()
      .delete()
      .where('medicalAlertSettingsId = :medicalAlertSettingsId', {
        medicalAlertSettingsId,
      })
      .execute()
      .catch((err) => {
        throw err;
      });
  }

  async updatePatientMedicalRiskLevel(
    patientId: string,
    dto: IUpdatePatientMedicalRisk,
  ) {
    try {
      const previousRisk = await this.getPatientMedicalRisk(patientId);
      if (previousRisk) {
        return await this.updatePatientMedicalRisk(patientId, dto);
      } else {
        return await this.createPatientMedicalRisk({
          patientId,
          ...dto,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdatePatientVitalRisk(
    patientId: string,
    dtos: IUpdatePatientVitalRisk[],
  ) {
    try {
      const existingVitalRisk = await this.getPatientVitalRisk(patientId);
      if (existingVitalRisk && existingVitalRisk.length > 0) {
        const existingRiskObj = {};
        existingVitalRisk.forEach((vitalRisk) => {
          existingRiskObj[vitalRisk.vitalSignId] = vitalRisk;
        });
        const updateDto = [];
        const newVitalsId = [];
        dtos.forEach((dto) => {
          newVitalsId.push(dto.vitalSignId);
          if (existingRiskObj[dto.vitalSignId]) {
            updateDto.push({
              ...existingRiskObj[dto.vitalSignId],
              ...dto,
              updatedAt: new Date(), // Quick fix for updating Updated at column
            });
          } else {
            updateDto.push({
              patientId,
              ...dto,
            });
          }
        });
        const newVitals = await this.patientVitalRiskRepository.save(updateDto);
        await this.deletePatientVitalRisks(patientId, newVitalsId);
        return newVitals;
      } else {
        const createDto = dtos.map((dto) => {
          return {
            patientId,
            ...dto,
          };
        });
        return await this.patientVitalRiskRepository.save(createDto);
      }
    } catch (error) {
      throw error;
    }
  }

  async deletePatientVitalRisks(patientId: string, excludeVitalsId?: string[]) {
    const deleteQuery = this.patientVitalRiskRepository
      .createQueryBuilder()
      .delete()
      .where('patientId =:patientId', { patientId });
    if (excludeVitalsId && excludeVitalsId.length > 0) {
      deleteQuery.andWhere('vitalSignId NOT IN (:...excludeVitalsId)', {
        excludeVitalsId,
      });
    }
    return await deleteQuery.execute().catch((err) => {
      throw err;
    });
  }
}
