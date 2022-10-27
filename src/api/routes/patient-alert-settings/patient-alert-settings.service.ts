import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PatientAlertSettings } from '../../../models/patient_alert_settings/entity/patient_alert_settings.entity';
import { PatientAlertSettingsModelService } from '../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { Role } from 'src/models/user/entity/user.enum';
import { ICreateOrUpdatePatientAlertSettings } from 'src/models/patient_alert_settings/interfaces';
import { VitalSignsModelService } from 'src/models/vital_signs/vital_signs.model.service';
import { PatientAlertSettingsResponseDto } from './dto/responses/patient_alert_settings.response.dto';

@Injectable()
export class PatientAlertSettingsService {
  constructor(
    private patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private userModelService: UserModelService,
    private vitalSignsModelService: VitalSignsModelService,
  ) {}

  async update(
    updatePatientAlertSettings: ICreateOrUpdatePatientAlertSettings,
  ): Promise<PatientAlertSettings> {
    const patientAlertSettings = await this.patientAlertSettingsModelService.findByPatientId(
      updatePatientAlertSettings.patientId,
    );
    if (!patientAlertSettings) {
      return await this.patientAlertSettingsModelService.create(
        updatePatientAlertSettings,
      );
    }
    return await this.patientAlertSettingsModelService.update(
      patientAlertSettings.id,
      updatePatientAlertSettings,
    );
  }

  async validatePatientId(id: string): Promise<boolean> {
    const patient = await this.userModelService.findOneById(id);
    if (!patient || patient.role !== Role.PATIENT) {
      throw new HttpException('Invalid patient Id', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async getAllPatientAlertSettings(
    patientId: string,
  ): Promise<PatientAlertSettingsResponseDto> {
    const [alertSettings, vitalSignsSettings] = await Promise.all([
      this.patientAlertSettingsModelService.findByPatientId(patientId),
      this.vitalSignsModelService.getPatientVitalSignsObject(patientId),
    ]);
    return {
      ...alertSettings,
      vitalSigns: vitalSignsSettings,
    };
  }
}
