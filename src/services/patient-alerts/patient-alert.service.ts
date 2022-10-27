import { Injectable } from '@nestjs/common';
import {
  PATIENT_DASHBOARD_LINK,
  PATIENT_ACKNOWLEDGEMENT_LINK,
} from 'src/config/constants';
import {
  NOTIFICATION_EVENTS,
  ALERT_TYPE,
  DATA_SERVER_PATIENT_ALERTS,
  APP_SERVER_PATIENT_ALERTS,
  PATIENT_PRESCRIPTION_BASED_INPUTS,
  PATIENT_DAILY_BASED_INPUTS,
} from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { User } from 'src/models/user/entity/user.entity';
import { ICreateAlertNotificationMessageAndPayload } from './interfaces';
import { NotificationService } from '../notification/notification.service';
import { PatientAlertSettings } from 'src/models/patient_alert_settings/entity/patient_alert_settings.entity';
import { PatientAlertSettingsModelService } from '../../models/patient_alert_settings/patient_alert_settings.model.service';
import {
  checkDateOccursInBetweenDates,
  getStartOfDayDate,
  geStartOfToday,
  geStartOfYesterday,
} from 'src/common/utils/date_helper';
import { PatientMedicationInputModelService } from '../../models/patient_medication_input/patient_medication_input.model.service';
import { MedicationPrescriptionModelService } from '../../models/medication_prescription/medication_prescription.model.service';
import { PatientBreathingInputModelService } from '../../models/patient_breathing_input/patient_breathing_input.model.service';
import { BreatingExercisePrescriptionModelService } from '../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import { PatientHealthInputModelService } from '../../models/patient_health_inputs/patient_health_inputs.model.service';
import { PatientSymptomsInputModelService } from '../../models/patient_symptoms_input/patient_symptoms_input.model.service';
import { IFindMedicationPrescriptionsBetweenDatesFilter } from 'src/models/medication_prescription/interfaces';
import { IFindBreathingExercisePrescriptionsBetweenDatesFilter } from 'src/models/breathing_exercise_prescription/interfaces';
import { PatientSupervisionMappingModelService } from '../../models/patient_supervision_mapping/patient_supervision_mapping.model.service';
import { LogService } from '../logger/logger.service';

@Injectable()
export class PatientAlertService {
  constructor(
    private logService: LogService,
    private notificationService: NotificationService,
    private patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
    private patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private patientMedicationInputModelService: PatientMedicationInputModelService,
    private medicationPrescriptionModelService: MedicationPrescriptionModelService,
    private breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
    private patientBreathingInputModelService: PatientBreathingInputModelService,
    private patientSymptomsInputModelService: PatientSymptomsInputModelService,
    private patientHealthInputModelService: PatientHealthInputModelService,
  ) {}

  async createPatientAlertNotificationMessageAndPayload(
    alert: ALERT_TYPE,
    biomarker: DATA_SERVER_PATIENT_ALERTS | APP_SERVER_PATIENT_ALERTS,
  ): Promise<ICreateAlertNotificationMessageAndPayload> {
    const alertEvent =
      alert === ALERT_TYPE.AMBER_ALERT
        ? NOTIFICATION_EVENTS.AMBER_ALERT_PATIENT
        : NOTIFICATION_EVENTS.RED_ALERT_PATIENT;
    return {
      messages: await this.notificationService.createNotificationMessage(
        {
          ...alertEvent,
          notificationType: NotificationType.PUSH,
        },
        {
          BIOMARKER: biomarker.replace(/_/g, ' '),
          PATIENT_DASHBOARD_LINK,
        },
      ),
      payload: {
        biomarker,
      },
      event: alertEvent,
    };
  }

  async createClinicianAlertNotificationMessageAndPayload(
    alert: ALERT_TYPE,
    biomarker: DATA_SERVER_PATIENT_ALERTS | APP_SERVER_PATIENT_ALERTS,
    patient: User,
  ): Promise<ICreateAlertNotificationMessageAndPayload> {
    const event =
      alert === ALERT_TYPE.AMBER_ALERT
        ? NOTIFICATION_EVENTS.AMBER_ALERT_CLINICIAN
        : NOTIFICATION_EVENTS.RED_ALERT_CLINICIAN;
    return {
      messages: await this.notificationService.createNotificationMessage(
        {
          ...event,
          notificationType: NotificationType.PUSH,
        },
        {
          NAME: patient.firstName,
          BIOMARKER: biomarker.replace(/_/g, ' '),
          PATIENT_DASHBOARD_LINK,
          PATIENT_ACKNOWLEDGEMENT_LINK,
        },
      ),
      payload: {
        biomarker,
      },
      event,
    };
  }

  async createCaretakerAlertNotificationMessageAndPayload(
    alert: ALERT_TYPE,
    biomarker: DATA_SERVER_PATIENT_ALERTS | APP_SERVER_PATIENT_ALERTS,
    patient: User,
  ): Promise<ICreateAlertNotificationMessageAndPayload> {
    const event =
      alert === ALERT_TYPE.AMBER_ALERT
        ? NOTIFICATION_EVENTS.AMBER_ALERT_CAREGIVER
        : NOTIFICATION_EVENTS.RED_ALERT_CAREGIVER;
    return {
      messages: await this.notificationService.createNotificationMessage(
        {
          ...event,
          notificationType: NotificationType.PUSH,
        },
        {
          NAME: patient.firstName,
          BIOMARKER: biomarker.replace(/_/g, ' '),
          PATIENT_DASHBOARD_LINK,
          PATIENT_ACKNOWLEDGEMENT_LINK,
        },
      ),
      payload: {
        biomarker,
      },
      event,
    };
  }

  async sendAlertNotificationToPatientAndSupervisors(
    patient: User,
    alertType: ALERT_TYPE,
    biomarker: DATA_SERVER_PATIENT_ALERTS | APP_SERVER_PATIENT_ALERTS,
  ) {
    this.logService.logInfo(
      `Sending alert notification of patient ${patient.username} `,
      { alertType, biomarker },
    );
    const [
      patientMessageAndPayload,
      clinicianMessageAndPayload,
      caretakerMessageAndPayload,
      patientSupervisors,
    ] = await Promise.all([
      this.createPatientAlertNotificationMessageAndPayload(
        alertType,
        biomarker,
      ),
      this.createClinicianAlertNotificationMessageAndPayload(
        alertType,
        biomarker,
        patient,
      ),
      this.createCaretakerAlertNotificationMessageAndPayload(
        alertType,
        biomarker,
        patient,
      ),
      this.patientSupervisionMappingModelService.getPatientCaretakersAndCliniciansId(
        patient.id,
      ),
    ]);
    //send notification to patient
    this.notificationService.generateNotification(
      {
        ...patientMessageAndPayload.messages,
        actorId: patient.id,
        payload: patientMessageAndPayload.payload,
      },
      [patient.id],
      patientMessageAndPayload.event,
    );
    //send notification to clinicians
    if (
      patientSupervisors.clinicians &&
      patientSupervisors.clinicians.length > 0
    ) {
      this.notificationService.generateNotification(
        {
          ...clinicianMessageAndPayload.messages,
          actorId: patient.id,
          payload: clinicianMessageAndPayload.payload,
        },
        patientSupervisors.clinicians,
        clinicianMessageAndPayload.event,
      );
    }
    //send notification to caretakers
    if (
      patientSupervisors.caretakers &&
      patientSupervisors.caretakers.length > 0
    ) {
      this.notificationService.generateNotification(
        {
          ...caretakerMessageAndPayload.messages,
          actorId: patient.id,
          payload: caretakerMessageAndPayload.payload,
        },
        patientSupervisors.caretakers,
        caretakerMessageAndPayload.event,
      );
    }
  }

  getInputMissedAlertSettingsValueByType(
    type: PATIENT_PRESCRIPTION_BASED_INPUTS | PATIENT_DAILY_BASED_INPUTS,
    alertSettings: PatientAlertSettings,
  ): { applicability: boolean; amberValue: number; redValue: number } {
    let applicability = false;
    let amberValue = 0;
    let redValue = 0;
    switch (type) {
      case PATIENT_PRESCRIPTION_BASED_INPUTS.MEDICATION_INPUT:
        applicability = alertSettings.medicationDaysMissedApplicability;
        amberValue = alertSettings.medicationDaysMissedAmber;
        redValue = alertSettings.medicationDaysMissedRed;
        break;
      case PATIENT_PRESCRIPTION_BASED_INPUTS.BREATHING_INPUT:
        applicability = alertSettings.breathingExerciseDaysMissedApplicability;
        amberValue = alertSettings.breathingExerciseDaysMissedAmber;
        redValue = alertSettings.breathingExerciseDaysMissedRed;
        break;
      case PATIENT_DAILY_BASED_INPUTS.HEALTH_INPUT:
        applicability = alertSettings.healthInputsDaysMissedApplicability;
        amberValue = alertSettings.healthInputsDaysMissedAmber;
        redValue = alertSettings.healthInputsDaysMissedRed;
        break;
      case PATIENT_DAILY_BASED_INPUTS.SYMPTOMS_INPUT:
        applicability = alertSettings.symptomsDaysMissedApplicability;
        amberValue = alertSettings.symptomsDaysMissedAmber;
        redValue = alertSettings.symptomsDaysMissedRed;
        break;
    }
    return {
      applicability,
      amberValue,
      redValue,
    };
  }

  async getPatientLatestInputByType(
    type: PATIENT_PRESCRIPTION_BASED_INPUTS | PATIENT_DAILY_BASED_INPUTS,
    patient: User,
  ) {
    switch (type) {
      case PATIENT_PRESCRIPTION_BASED_INPUTS.MEDICATION_INPUT:
        return await this.patientMedicationInputModelService.getOneLatestInput(
          patient.id,
        );
      case PATIENT_PRESCRIPTION_BASED_INPUTS.BREATHING_INPUT:
        return await this.patientBreathingInputModelService.getOneLatestInput(
          patient.id,
        );
      case PATIENT_DAILY_BASED_INPUTS.HEALTH_INPUT:
        return await this.patientHealthInputModelService.getOneLatestInput(
          patient.id,
        );
      case PATIENT_DAILY_BASED_INPUTS.SYMPTOMS_INPUT:
        return await this.patientSymptomsInputModelService.getOneLatestInput(
          patient.id,
        );
    }
  }

  async getPatientPrescriptionsBetweenDatesByInputType(
    type: PATIENT_PRESCRIPTION_BASED_INPUTS,
    queryFilter:
      | IFindMedicationPrescriptionsBetweenDatesFilter
      | IFindBreathingExercisePrescriptionsBetweenDatesFilter,
  ) {
    switch (type) {
      case PATIENT_PRESCRIPTION_BASED_INPUTS.MEDICATION_INPUT:
        return await this.medicationPrescriptionModelService.getPatientMedicationPrescriptionsBetweenDates(
          queryFilter,
        );
      case PATIENT_PRESCRIPTION_BASED_INPUTS.BREATHING_INPUT:
        return await this.breatingExercisePrescriptionModelService.getPatientBreathingPrescriptionsBetweenDates(
          queryFilter,
        );
    }
  }

  async getPatientPrescriptionBasedInputsMissedAlert(
    type: PATIENT_PRESCRIPTION_BASED_INPUTS,
    patient: User,
    alertSettings?: PatientAlertSettings,
  ): Promise<{ amberAlert: boolean; redAlert: boolean }> {
    if (!alertSettings) {
      alertSettings = await this.patientAlertSettingsModelService.findByPatientId(
        patient.id,
      );
    }
    const {
      applicability,
      amberValue,
      redValue,
    } = this.getInputMissedAlertSettingsValueByType(type, alertSettings);
    let complianceScore = 0;
    if (applicability) {
      const startOfToday = geStartOfToday();
      const startOfYesterday = geStartOfYesterday();
      const latestInput = await this.getPatientLatestInputByType(type, patient);
      if (latestInput) {
        const inputDate = getStartOfDayDate(latestInput.calendar.date);
        if (!(inputDate === startOfToday || inputDate === startOfYesterday)) {
          const fromDate = new Date(inputDate);
          fromDate.setDate(fromDate.getDate() + 1);
          // get prescriptions from next day of last input and current day
          const prescriptions = await this.getPatientPrescriptionsBetweenDatesByInputType(
            type,
            {
              patientId: patient.id,
              options: { startDate: fromDate, endDate: startOfToday },
            },
          );
          // check for empty prescriptions
          if (prescriptions && prescriptions.length > 0) {
            for (
              let startDate = new Date(fromDate);
              startDate < startOfToday && complianceScore < redValue;
              startDate.setDate(startDate.getDate() + 1)
            ) {
              if (checkDateOccursInBetweenDates(prescriptions, startDate)) {
                complianceScore += 1;
              }
            }
          }
        }
      } else {
        // get prescriptions till today
        const prescriptions = await this.getPatientPrescriptionsBetweenDatesByInputType(
          type,
          {
            patientId: patient.id,
            options: { endDate: startOfToday },
          },
        );
        // check for empty prescriptions
        if (prescriptions && prescriptions.length > 0) {
          const fromDate = getStartOfDayDate(prescriptions[0].startDate);
          for (
            let startDate = new Date(fromDate);
            startDate < startOfToday && complianceScore < redValue;
            startDate.setDate(startDate.getDate() + 1)
          ) {
            if (checkDateOccursInBetweenDates(prescriptions, startDate)) {
              complianceScore += 1;
            }
          }
        }
      }
    }
    return {
      amberAlert: applicability && complianceScore >= amberValue ? true : false,
      redAlert: applicability && complianceScore >= redValue ? true : false,
    };
  }

  async getPatientDailyBasedInputsMissedAlert(
    type: PATIENT_DAILY_BASED_INPUTS,
    patient: User,
    alertSettings?: PatientAlertSettings,
  ): Promise<{ amberAlert: boolean; redAlert: boolean }> {
    if (!alertSettings) {
      alertSettings = await this.patientAlertSettingsModelService.findByPatientId(
        patient.id,
      );
    }
    const {
      applicability,
      amberValue,
      redValue,
    } = this.getInputMissedAlertSettingsValueByType(type, alertSettings);
    let complianceScore = 0;
    if (applicability) {
      const startOfToday = geStartOfToday();
      const startOfYesterday = geStartOfYesterday();
      const latestInput = await this.getPatientLatestInputByType(type, patient);
      if (latestInput) {
        const inputDate = getStartOfDayDate(latestInput.calendar.date);
        complianceScore =
          inputDate < startOfYesterday
            ? (startOfYesterday.getTime() - inputDate.getTime()) /
              (1000 * 60 * 60 * 24)
            : 0;
      } else {
        const onboardDate = getStartOfDayDate(patient.createdAt);
        for (
          let startDate = new Date(onboardDate);
          startDate < startOfToday && complianceScore < redValue;
          startDate.setDate(startDate.getDate() + 1)
        ) {
          complianceScore += 1;
        }
      }
    }
    return {
      amberAlert: applicability && complianceScore >= amberValue ? true : false,
      redAlert: applicability && complianceScore >= redValue ? true : false,
    };
  }
}
