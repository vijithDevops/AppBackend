import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientAlertSettings } from './entity/patient_alert_settings.entity';
import { ICreateOrUpdatePatientAlertSettings } from './interfaces';

@Injectable()
export class PatientAlertSettingsModelService {
  constructor(
    @InjectRepository(PatientAlertSettings)
    private patientAlertSettingsRepository: Repository<PatientAlertSettings>,
  ) {}

  async create(
    createPatientAlertSettings: ICreateOrUpdatePatientAlertSettings,
  ): Promise<PatientAlertSettings> {
    return await this.patientAlertSettingsRepository.save(
      createPatientAlertSettings,
    );
  }

  async findByPatientId(patientId: string): Promise<PatientAlertSettings> {
    const alertSettings = await this.patientAlertSettingsRepository.findOne({
      patientId,
    });
    if (!alertSettings) {
      return await this.create({
        patientId,
      });
    }
    return alertSettings;
  }

  async deleteByPatientId(patientId: string) {
    return await this.patientAlertSettingsRepository.delete({
      patientId,
    });
  }

  async updatePatientAlertSettingsObject(
    object: PatientAlertSettings,
  ): Promise<PatientAlertSettings> {
    return await this.patientAlertSettingsRepository.save(object);
  }

  async update(
    id: string,
    updateObject: ICreateOrUpdatePatientAlertSettings,
  ): Promise<PatientAlertSettings> {
    return await this.patientAlertSettingsRepository.save({
      id,
      ...updateObject,
    });
  }
}
