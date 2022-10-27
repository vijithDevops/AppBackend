import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PatientAlertService } from '../../../services/patient-alerts/patient-alert.service';
import { PatientAlertSettingsModelService } from '../../../models/patient_alert_settings/patient_alert_settings.model.service';
import { User } from 'src/models/user/entity/user.entity';
import {
  ALERT_TYPE,
  APP_SERVER_PATIENT_ALERTS,
} from 'src/config/master-data-constants';
import { PatientSymptomsInputModelService } from 'src/models/patient_symptoms_input/patient_symptoms_input.model.service';

@Injectable()
export class PatientSymptomsInputService {
  constructor(
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly patientSymptomsInputModelService: PatientSymptomsInputModelService,
    private readonly patientAlertService: PatientAlertService,
  ) {}

  async validateCreateSymptomsInput(
    patientId: string,
    calendarId: string,
  ): Promise<void> {
    const input = await this.patientSymptomsInputModelService.findByPatientId(
      patientId,
      { calendarId },
    );
    if (input && input.length > 0) {
      throw new HttpException(
        `Symptoms input already added for today's date`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async SendPatientAlertForSymptomsScore(score: number, patient: User) {
    const alertSettings = await this.patientAlertSettingsModelService.findByPatientId(
      patient.id,
    );
    if (alertSettings.symptomsScoreApplicability) {
      const amberValue = alertSettings.symptomsScoreAmber;
      const redValue = alertSettings.symptomsScoreRed;
      if (score >= redValue) {
        this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
          patient,
          ALERT_TYPE.RED_ALERT,
          APP_SERVER_PATIENT_ALERTS.SYMPTOMS_SCORE,
        );
      } else if (score >= amberValue) {
        this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
          patient,
          ALERT_TYPE.AMBER_ALERT,
          APP_SERVER_PATIENT_ALERTS.SYMPTOMS_SCORE,
        );
      }
    }
  }
}
