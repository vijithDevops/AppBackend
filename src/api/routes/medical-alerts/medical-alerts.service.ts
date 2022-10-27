import { BadRequestException, Injectable } from '@nestjs/common';
import { MedicalAlertModelService } from 'src/models/medical_alerts/medical_alerts.model.service';
import { NotificationEventMasterModelService } from 'src/models/notification_event_master/notification_event_master.model.service';
import { VitalSignsModelService } from 'src/models/vital_signs/vital_signs.model.service';
import { camelCase } from 'lodash';
import {
  UpdateMedicalAlertNotificationSettingsDto,
  UpdateVitalSignsDto,
} from './dto';
import { EventSchedulerService } from '../../../services/event-scheduler/event-scheduler.service';
import { INTERVAL_JOBS } from 'src/services/event-scheduler/event-scheduler.enum';
import { ResolutionType } from 'src/models/medical_alerts/entity/medical_alerts.enum';
import {
  MEDICAL_ALERT_DAILY_SCHEDULE_AT,
  MEDICAL_ENGINE_DAILY_FILTER_MONTHS_BEFORE,
  MEDICAL_ENGINE_HOURLY_FILTER_DAYS_BEFORE,
} from 'src/config/constants';
import { LogService } from 'src/services/logger/logger.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { subtractDays, subtractMonths } from 'src/common/utils/date_helper';
import { DataProcessingServerService } from '../../../services/data-processing-server/data-processing-server.service';
import { RiskLevel } from 'src/models/medical_alerts/entity/medical_alerts.enum';
import { MeasuringScale } from 'src/models/vital_signs/entity/vital_sign.enum';
import { User } from 'src/models/user/entity/user.entity';
import { IGetDataServerTrendsFilter } from './interfaces/data_server_filter';
import { MedicalAlertSettings } from 'src/models/medical_alerts/entity/medical_alert_settings.entity';
import {
  IMedicalAlertNotificationMessage,
  IPatientRiskLevels,
  IVitalSignSettings,
} from './interfaces';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { PatientMedicalRisk } from 'src/models/medical_alerts/entity/patient_medical_risk.entity';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { PatientMedicalRiskHistoryModelService } from 'src/models/patient_medical_risk_history/patient_medical_risk_history.model.service';
import { PatientVitalRiskHistoryModelService } from 'src/models/patient_vital_risk_history/patient_vital_risk_history.model.service';
import { IPatientVitalRisks } from './interfaces/patient_vital_risks';
import { JWTService } from './../../../services/jwt-service/jwt-service.service';

@Injectable()
export class MedicalAlertsService {
  constructor(
    private readonly medicalAlertModelService: MedicalAlertModelService,
    private readonly vitalSignsModelService: VitalSignsModelService,
    private readonly notificationEventMasterModelService: NotificationEventMasterModelService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly userModelService: UserModelService,
    private readonly dataProcessingServerService: DataProcessingServerService,
    private readonly notificationService: NotificationService,
    private logService: LogService,
    private readonly patientMedicalRiskHistoryModelService: PatientMedicalRiskHistoryModelService,
    private readonly patientVitalRiskHistoryModelService: PatientVitalRiskHistoryModelService,
    private readonly jwtService: JWTService,
  ) {}

  async findOrganizationMedicalAlertSettings(organizationId: string) {
    const medicalAlertSettings = await this.medicalAlertModelService.findOneSettingsByOrganizationId(
      organizationId,
    );
    const vitalSignsSettings = await this.vitalSignsModelService.getOrganizationVitalSigns(
      organizationId,
      true,
    );
    const notificationSettings = await this.getNotificationSettingsBySettingsId(
      medicalAlertSettings.id,
    );
    //TODO:Quick fix for medical engine settings sort. Remove it once changes updated
    const sortOrder = [
      'temperature',
      'respiratory_rate_lower_than',
      'heart_rate_higher_than',
      'spo2',
      'respiratory_rate_higher_than',
      'blood_pressure_systolic_lower_than',
      'blood_pressure_diastolic_lower_than',
      'blood_pressure_diastolic_higher_than',
      'blood_pressure_systolic_higher_than',
      'tidal_depth',
      'heart_rate_lower_than',
    ];
    vitalSignsSettings.sort(
      (a, b) => sortOrder.indexOf(a.key) - sortOrder.indexOf(b.key),
    );
    return {
      ...medicalAlertSettings,
      notificationMessageTemplates: notificationSettings,
      vitalSigns: vitalSignsSettings,
    };
  }

  async getNotificationSettingsBySettingsId(
    medicalAlertSettingsId: string,
  ): Promise<{ [key: string]: string }> {
    try {
      const medicalAlertEvents = await this.notificationEventMasterModelService.getMedicalAlertEventsBySettingsId(
        medicalAlertSettingsId,
      );
      const notificationSettings = {};
      medicalAlertEvents.forEach((event) => {
        // set default message template from Notification Event Master table
        let eventTemplate = event.messageTemplate;
        if (
          event.medicalAlertNotificationSettings &&
          event.medicalAlertNotificationSettings.length > 0
        ) {
          // Over ride master data with custom saved template for the settings
          eventTemplate =
            event.medicalAlertNotificationSettings[0].messageTemplate;
        }
        notificationSettings[`${camelCase(event.eventName)}`] = eventTemplate;
      });
      return notificationSettings;
    } catch (error) {
      throw error;
    }
  }

  async validateVitalSignsInputAndGetUpdateObject(
    vitalSignsInput: UpdateVitalSignsDto[],
  ): Promise<
    {
      vitalSignId: string;
      updateObject: {
        isApplicable: boolean;
        amberValue: number;
        redValue: number;
      };
    }[]
  > {
    try {
      const vitalSigns = await this.vitalSignsModelService.getAllVitalSignsObject();
      return vitalSignsInput.map((input) => {
        if (vitalSigns[input.key]) {
          return {
            vitalSignId: vitalSigns[input.key].id,
            updateObject: {
              isApplicable: input.isApplicable,
              amberValue: input.amberValue
                ? input.amberValue
                : vitalSigns[input.key].amberValue,
              redValue: input.redValue
                ? input.redValue
                : vitalSigns[input.key].redValue,
            },
          };
        } else {
          throw new BadRequestException(
            `Invalid ${input.key} input key for vital signs`,
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async validateMedicalAlertNotificationInputAndGetUpdateObject(
    inputSettings: UpdateMedicalAlertNotificationSettingsDto,
  ): Promise<{ eventId: string; template: string }[]> {
    try {
      const medicalAlertEvents = await this.notificationEventMasterModelService.getAllMedicalAlertEvents();
      const notificationSettings = {};
      medicalAlertEvents.forEach((event) => {
        notificationSettings[`${camelCase(event.eventName)}`] = event;
      });
      const updateObject = [];
      Object.keys(inputSettings).forEach((key) => {
        if (notificationSettings[key]) {
          updateObject.push({
            eventId: notificationSettings[key].id,
            template: inputSettings[key],
          });
        } else {
          throw new BadRequestException(
            `Invalid ${key} key for notification template`,
          );
        }
      });
      return updateObject;
    } catch (error) {
      throw error;
    }
  }

  async updateMedicalAlertScheduler(alertSettingsId): Promise<void> {
    try {
      const medicalAlertSettings = await this.medicalAlertModelService.validateAndFindOneById(
        alertSettingsId,
      );
      if (medicalAlertSettings.schedulerId) {
        await this.eventSchedulerService.deleteJob(
          medicalAlertSettings.schedulerId,
        );
      }
      if (medicalAlertSettings.isActive) {
        const schedulerId = await this.eventSchedulerService.createIntervalJob({
          type: INTERVAL_JOBS.MEDICAL_ALERTS,
          interval: this.createSchedulerInterval(
            medicalAlertSettings.resolution,
          ),
          payload: { id: medicalAlertSettings.id },
        });
        await this.medicalAlertModelService.updateMedicalAlertSettingsById(
          medicalAlertSettings.id,
          { schedulerId: schedulerId },
        );
      } else {
        await this.medicalAlertModelService.updateMedicalAlertSettingsById(
          medicalAlertSettings.id,
          { schedulerId: null },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private createSchedulerInterval(resolution: ResolutionType): string {
    try {
      switch (resolution) {
        case ResolutionType.HOURLY:
          return '0 * * * *';
        case ResolutionType.DAILY:
          return `0 ${MEDICAL_ALERT_DAILY_SCHEDULE_AT} * * *`;
      }
    } catch (error) {
      throw error;
    }
  }

  async triggerMedicalAlertJobBySchedulerId(
    schedulerId: string,
  ): Promise<void> {
    try {
      const medicalAlertSettings = await this.medicalAlertModelService.findOneBySchedulerId(
        schedulerId,
      );
      if (!medicalAlertSettings.isActive) {
        throw new Error(
          'Medical alert Engine is disabled for the organization',
        );
      }
      const notificationMessages = await this.notificationService.getMedicalAlertNotificationMessages(
        medicalAlertSettings.id,
        NotificationType.PUSH,
      );
      const dataServerFilter = this.getDataServerApiFilter(
        medicalAlertSettings.resolution,
      );
      const dataServerHeaders = await this.getDataServerApiHeaders();
      const orgPatients = await this.userModelService.getAllPatientsAndTheirVitalSignsSettings(
        medicalAlertSettings.organizationId,
      );
      this.logService.logInfo('Dataserver trends query: ', dataServerFilter);
      orgPatients.forEach(async (patient) => {
        //TODO: Move this async API call outside the loop
        const patientRisk = await this.calculateAndGetPatientRiskLevels(
          patient,
          medicalAlertSettings,
          dataServerFilter,
          dataServerHeaders,
        );
        if (patientRisk.red || patientRisk.amber || patientRisk.green) {
          this.updatePatientMedicalRiskAndSendNotification(
            patient,
            patientRisk,
            medicalAlertSettings,
            notificationMessages,
          );
        } else {
          // TODO: Here patients with no valid data points: Currently considering the previous risk and that will be valid for 1 day;
        }
        if (patientRisk.vitalRisk.length > 0) {
          const nonGreenRisk = patientRisk.vitalRisk.filter((risk) => {
            return risk.riskLevel !== RiskLevel.GREEN;
          });
          if (nonGreenRisk.length > 0) {
            this.medicalAlertModelService.createOrUpdatePatientVitalRisk(
              patient.id,
              patientRisk.vitalRisk,
            );
          }
        } else {
          // NO vital letiations found so delete existing Vital sign flag(if any)
          if (
            await this.medicalAlertModelService.isAnyPatientVitalRisk(
              patient.id,
            )
          ) {
            await this.medicalAlertModelService.deletePatientVitalRisks(
              patient.id,
            );
          }
        }
      });
    } catch (error) {
      this.logService.logError('Failed in triggerig medical alert job', {
        error,
      });
      throw error;
    }
  }

  private async updatePatientMedicalRiskAndSendNotification(
    patient: User,
    patientRisk: IPatientRiskLevels,
    medicalAlertSettings: MedicalAlertSettings,
    notificationMessages: IMedicalAlertNotificationMessage,
  ): Promise<void> {
    try {
      const previousMedicalRisk = await this.medicalAlertModelService.getPatientMedicalRisk(
        patient.id,
      );
      const patientMedicalRisk = this.findPatientMedicalRiskLevel(
        patientRisk,
        previousMedicalRisk,
        medicalAlertSettings,
      );
      // update medical risk
      await this.medicalAlertModelService.updatePatientMedicalRiskLevel(
        patient.id,
        patientMedicalRisk,
      );
      // TODO: Update historial Medical risk(patientId, time, riskLevel) and vital risk(Array of(medcialRiskId, vitalSignId, riskLevel)) tables
      await this.patientHistoryRisk(
        patient.id,
        patientRisk.vitalRisk,
        patientMedicalRisk.riskLevel,
        medicalAlertSettings.resolution,
      );
      // risk level notifier applicability
      const notifyRisk = this.getRiskLevelNotifierApplicability(
        patientMedicalRisk.riskLevel,
        medicalAlertSettings,
      );
      // check for risk level notifcation applicability
      if (notifyRisk) {
        // If no previus risk then users should be notified
        // If previous risk level is equal to the current risk level and check for the applicability of reactivation time
        if (
          previousMedicalRisk &&
          previousMedicalRisk.riskLevel === patientMedicalRisk.riskLevel
        ) {
          // previous risk is equal to current risk
          if (
            medicalAlertSettings.reactivationHours ||
            medicalAlertSettings.reactivationDays
          ) {
            // Reactivation is enabled
            // Check reactivation period reached || any previous notification has send for the same risk
            if (
              !previousMedicalRisk.lastNotifiedAt ||
              this.getReactivateNotificationTime(
                previousMedicalRisk.lastNotifiedAt,
                medicalAlertSettings,
              ) <= new Date()
            ) {
              this.sendMedicalRiskNotification(
                patient,
                patientMedicalRisk.riskLevel,
                notificationMessages,
              );
            } else {
              // previous notification has not crossed Reactivation period So No need to Notify any users
            }
          } else {
            // Reactivation settings are disabled so no need of sending notification
          }
        } else {
          // Previous risk and current risk are different so we can send the notification
          // Can send notification
          this.sendMedicalRiskNotification(
            patient,
            patientMedicalRisk.riskLevel,
            notificationMessages,
          );
        }
      }
    } catch (error) {
      this.logService.logError(
        'Failed in updating patient medical and sending notification risk',
        { error },
      );
      throw error;
    }
  }

  private findPatientMedicalRiskLevel(
    patientRisk: IPatientRiskLevels,
    previousMedicalRisk: PatientMedicalRisk,
    medicalAlertSettings: MedicalAlertSettings,
  ): {
    riskLevel: RiskLevel;
    consecutiveAmberRiskCount: number;
    acknowledgeRequired: boolean;
  } {
    const patientMedicalRisk = {
      riskLevel: RiskLevel.GREEN,
      consecutiveAmberRiskCount: 0,
      acknowledgeRequired: false,
    };
    if (patientRisk.red) {
      patientMedicalRisk.riskLevel = RiskLevel.RED;
    } else if (patientRisk.amber) {
      if (medicalAlertSettings.consecutiveAmberRisk) {
        if (previousMedicalRisk) {
          // If there is any new valid reading on any of the vital signs then the consecutiveAmberRiskCount should be incremented else no update is required;
          // ie; even if the previous risk was not amber, the consecutiveAmberRiskCount (ie; 0) will be incremented by 1
          // If the previous risk was not amber and no new valid readings (This happens when the medical engine setings got updated and on the next engine run results in amber risk)
          // then the value should start with counting 1 for amber risk
          patientMedicalRisk.consecutiveAmberRiskCount = patientRisk.latestReading
            ? previousMedicalRisk.consecutiveAmberRiskCount + 1
            : previousMedicalRisk.consecutiveAmberRiskCount === 0
            ? 1
            : previousMedicalRisk.consecutiveAmberRiskCount;
          if (
            patientMedicalRisk.consecutiveAmberRiskCount >=
            medicalAlertSettings.consecutiveAmberRisk
          ) {
            // Consecutive amber risk leads to red risk
            patientMedicalRisk.riskLevel = RiskLevel.RED;
          } else {
            // Consecutive amber risk not crossed settings value
            patientMedicalRisk.riskLevel = RiskLevel.AMBER;
          }
          // if (
          //   previousMedicalRisk.consecutiveAmberRiskCount + 1 >=
          //   medicalAlertSettings.consecutiveAmberRisk
          // ) {
          //   // Consecutive amber risk leads to red risk
          //   patientMedicalRisk.riskLevel = RiskLevel.RED;
          //   patientMedicalRisk.consecutiveAmberRiskCount =
          //     previousMedicalRisk.consecutiveAmberRiskCount + 1;
          // } else {
          //   // Consecutive amber risk not crossed settings value
          //   patientMedicalRisk.riskLevel = RiskLevel.AMBER;
          //   patientMedicalRisk.consecutiveAmberRiskCount =
          //     previousMedicalRisk.consecutiveAmberRiskCount + 1;
          // }
        } else {
          // No previous risk. ie; Amber risk for first time
          if (medicalAlertSettings.consecutiveAmberRisk === 1) {
            // Amber risk turns directly into red risk (as per the settings, consecutive amber risk to make red is 1)
            patientMedicalRisk.riskLevel = RiskLevel.RED;
          } else {
            patientMedicalRisk.riskLevel = RiskLevel.AMBER;
          }
          patientMedicalRisk.consecutiveAmberRiskCount = 1;
        }
      } else {
        patientMedicalRisk.riskLevel = RiskLevel.AMBER;
        // No consecutive amber risk is enabled;
      }
    } else {
      patientMedicalRisk.riskLevel = RiskLevel.GREEN;
    }
    patientMedicalRisk.acknowledgeRequired = this.isPatientRiskRequiresAcknowledgement(
      patientMedicalRisk.riskLevel,
      previousMedicalRisk,
      medicalAlertSettings,
    );
    return patientMedicalRisk;
  }

  private getRiskLevelNotifierApplicability(
    riskLevel: RiskLevel,
    medicalAlertSettings: MedicalAlertSettings,
  ): boolean {
    switch (riskLevel) {
      case RiskLevel.RED:
        return medicalAlertSettings.notifyRedRisk;
      case RiskLevel.AMBER:
        return medicalAlertSettings.notifyAmberRisk;
      case RiskLevel.GREEN:
        return medicalAlertSettings.notifyGreenRisk;
    }
  }

  private isPatientRiskRequiresAcknowledgement(
    riskLevel: RiskLevel,
    previousMedicalRisk: PatientMedicalRisk,
    medicalAlertSettings: MedicalAlertSettings,
  ): boolean {
    if (previousMedicalRisk) {
      const previousAck = previousMedicalRisk.acknowledgeRequired;
      if (previousMedicalRisk.riskLevel === riskLevel) {
        if (
          medicalAlertSettings.reactivationHours ||
          medicalAlertSettings.reactivationDays
        ) {
          // Check reactivation period reached
          // If no lastNotifiedTime then previously the settings to send notification was turned off
          if (
            !previousMedicalRisk.lastNotifiedAt ||
            this.getReactivateNotificationTime(
              previousMedicalRisk.lastNotifiedAt,
              medicalAlertSettings,
            ) <= new Date()
          ) {
            // for same risk level and reactivation period has reached || No notification has been send yet
            return true;
          } else {
            // previous acknowledgement has not crossed Reactivation period So No need acknowledgemnt
            return previousAck;
          }
        } else {
          // same risk level but no reactivation period is set
          return riskLevel === RiskLevel.GREEN ? previousAck : true;
        }
      } else {
        switch (riskLevel) {
          case RiskLevel.RED:
            return true;
          case RiskLevel.AMBER:
            return previousMedicalRisk.riskLevel === RiskLevel.GREEN
              ? true
              : previousAck;
          case RiskLevel.GREEN:
            return previousAck;
        }
      }
    } else {
      // no previoud risk
      return riskLevel !== RiskLevel.GREEN;
    }
  }

  private sendMedicalRiskNotification(
    patient: User,
    riskLevel: RiskLevel,
    notificationMessages: IMedicalAlertNotificationMessage,
  ) {
    try {
      let message;
      let event;
      switch (riskLevel) {
        case RiskLevel.RED:
          message =
            notificationMessages[
              NOTIFICATION_EVENTS.RED_MEDICAL_ALERT_PATIENT.eventName
            ];
          event = NOTIFICATION_EVENTS.RED_MEDICAL_ALERT_PATIENT;
          break;
        case RiskLevel.AMBER:
          message =
            notificationMessages[
              NOTIFICATION_EVENTS.AMBER_MEDICAL_ALERT_PATIENT.eventName
            ];
          event = NOTIFICATION_EVENTS.AMBER_MEDICAL_ALERT_PATIENT;
          break;
        case RiskLevel.GREEN:
          message =
            notificationMessages[
              NOTIFICATION_EVENTS.GREEN_MEDICAL_ALERT_PATIENT.eventName
            ];
          event = NOTIFICATION_EVENTS.GREEN_MEDICAL_ALERT_PATIENT;
          break;
      }
      // send notification to patient
      this.notificationService.generateNotification(
        {
          ...message,
          actorId: patient.id,
          payload: {
            riskLevel,
          },
        },
        [patient.id],
        event,
      );
      // update patient last notified time
      this.medicalAlertModelService.updatePatientLastNotifiedTime(patient.id);
    } catch (error) {
      throw error;
    }
  }

  private getReactivateNotificationTime(
    lastNotifiedAt: Date,
    medicalAlertSettings: MedicalAlertSettings,
  ): Date {
    try {
      const nextNotificationDate = new Date(lastNotifiedAt);
      switch (medicalAlertSettings.resolution) {
        case ResolutionType.HOURLY:
          if (medicalAlertSettings.reactivationDays) {
            nextNotificationDate.setDate(
              nextNotificationDate.getDate() +
                medicalAlertSettings.reactivationDays,
            );
          }
          if (medicalAlertSettings.reactivationHours) {
            nextNotificationDate.setHours(
              nextNotificationDate.getHours() +
                medicalAlertSettings.reactivationHours,
            );
          }
          break;
        case ResolutionType.DAILY:
          if (medicalAlertSettings.reactivationDays) {
            nextNotificationDate.setDate(
              nextNotificationDate.getDate() +
                medicalAlertSettings.reactivationDays,
            );
          }
          break;
      }
      // adding a buffer of 2 min for proper check
      nextNotificationDate.setMinutes(nextNotificationDate.getMinutes() - 2);
      return nextNotificationDate;
    } catch (error) {
      throw error;
    }
  }

  private getDataServerApiFilter(
    resolution: ResolutionType,
  ): IGetDataServerTrendsFilter {
    try {
      // const fromTime = subtractHours(1, new Date());
      const fromTime = new Date();
      switch (resolution) {
        case ResolutionType.HOURLY:
          return {
            start_datetime: subtractDays(
              MEDICAL_ENGINE_HOURLY_FILTER_DAYS_BEFORE,
              fromTime,
            )
              .toISOString()
              .replace('Z', '')
              .split('.')[0],
            stop_datetime: fromTime
              .toISOString()
              .replace('Z', '')
              .split('.')[0],
            resolution: ResolutionType.HOURLY,
          };
        case ResolutionType.DAILY:
          return {
            start_datetime: subtractMonths(
              MEDICAL_ENGINE_DAILY_FILTER_MONTHS_BEFORE,
              fromTime,
            )
              .toISOString()
              .replace('Z', '')
              .split('.')[0],
            stop_datetime: fromTime
              .toISOString()
              .replace('Z', '')
              .split('.')[0],
            resolution: ResolutionType.DAILY,
          };
      }
    } catch (error) {
      throw error;
    }
  }

  private async getDataServerApiHeaders() {
    const admin = await this.userModelService.getAdminUser();
    const adminToken = this.jwtService.signToken({
      username: admin.username,
      sub: admin.id,
      role: admin.role,
    });
    return {
      Authorization: `Bearer ${adminToken}`,
    };
  }

  private checkVitalReadingsRiskLevel(
    vitalReadings: number[],
    risk: RiskLevel.AMBER | RiskLevel.RED,
    settings: IVitalSignSettings,
    choice: number,
  ): boolean {
    try {
      const riskValues = vitalReadings.filter((readings) => {
        let isRisk = false;
        if (readings != -1) {
          switch (risk) {
            case RiskLevel.AMBER:
              if (
                settings[MeasuringScale.HIGHER] &&
                readings >= settings[MeasuringScale.HIGHER].amberValue
              ) {
                isRisk = true;
              }
              if (
                settings[MeasuringScale.LOWER] &&
                readings <= settings[MeasuringScale.LOWER].amberValue
              ) {
                isRisk = true;
              }
              break;
            case RiskLevel.RED:
              if (
                settings[MeasuringScale.HIGHER] &&
                readings >= settings[MeasuringScale.HIGHER].redValue
              ) {
                isRisk = true;
              }
              if (
                settings[MeasuringScale.LOWER] &&
                readings <= settings[MeasuringScale.LOWER].redValue
              ) {
                isRisk = true;
              }
              break;
          }
        }
        return isRisk;
      });
      return riskValues.length >= choice;
    } catch (error) {
      throw error;
    }
  }

  private validateVitalReadings(readings: number[]): boolean {
    try {
      const validReadings = readings.filter((reading) => reading != -1);
      if (validReadings.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  private getValidVitalReadings(readings: number[]): number[] {
    try {
      return readings.filter((reading) => reading != -1);
    } catch (error) {
      throw error;
    }
  }

  private async calculateAndGetPatientRiskLevels(
    patient: User,
    medicalAlertSettings: MedicalAlertSettings,
    dataServerFilter: IGetDataServerTrendsFilter,
    dataServerHeaders: any,
  ): Promise<IPatientRiskLevels> {
    try {
      const trends = await this.dataProcessingServerService.getTrends(
        {
          id: patient.patientInfo.patientId,
          ...dataServerFilter,
        },
        dataServerHeaders,
      );
      const patientRisk = {
        amber: 0,
        red: 0,
        green: 0,
        latestReading: false,
        vitalRisk: [],
      };
      const vitalSignsSettings = {};
      patient.vitalSignsSettings.forEach((vitalSign) => {
        // check vitalsign applicability to patient and medical alert
        if (vitalSign.isApplicable && vitalSign.isMedicalEngineAlert) {
          if (vitalSignsSettings[vitalSign.vitalSignId]) {
            vitalSignsSettings[vitalSign.vitalSignId][
              vitalSign.measuringScale
            ] = vitalSign;
          } else {
            vitalSignsSettings[vitalSign.vitalSignId] = {
              vitalSignId: vitalSign.vitalSignId,
              vitalSignName: vitalSign.vitalSignName,
              externalKey: vitalSign.externalKey,
              [vitalSign.measuringScale]: vitalSign,
            };
          }
        } // End of vitals Applicability
      });
      Object.keys(vitalSignsSettings).forEach((vitalSign) => {
        if (trends[vitalSignsSettings[vitalSign].externalKey]) {
          const vitalReadings =
            trends[vitalSignsSettings[vitalSign].externalKey];
          const validVitalReadings = this.getValidVitalReadings(vitalReadings);
          if (validVitalReadings.length > 0) {
            this.logService.logInfo(
              `patient: ${patient.username} readings for ${vitalSignsSettings[vitalSign].externalKey}`,
              {
                total_readings: vitalReadings.length,
                last_reading: vitalReadings[vitalReadings.length - 1],
                last_valid_reading:
                  validVitalReadings[validVitalReadings.length - 1],
                last_time:
                  trends.listtime && trends.listtime.length
                    ? trends.listtime[trends.listtime.length - 1]
                    : 'Not aplicable',
                last_date:
                  trends.listdate && trends.listdate.length
                    ? trends.listdate[trends.listdate.length - 1]
                    : 'Not aplicable',
              },
            );
            let [isAmberRisk, isRedRisk, flagAdded] = [false, false, false];
            [isRedRisk, flagAdded] = this.updatePatientRiskAndGetRiskStatus(
              RiskLevel.RED,
              patientRisk,
              validVitalReadings,
              vitalSignsSettings[vitalSign],
              medicalAlertSettings,
            );
            // check red risk already happened
            if (!isRedRisk) {
              [isAmberRisk, flagAdded] = this.updatePatientRiskAndGetRiskStatus(
                RiskLevel.AMBER,
                patientRisk,
                validVitalReadings,
                vitalSignsSettings[vitalSign],
                medicalAlertSettings,
                !flagAdded,
              );
            } else if (!flagAdded) {
              this.updatePatientRiskFlag(
                RiskLevel.AMBER,
                patientRisk,
                validVitalReadings,
                vitalSignsSettings[vitalSign],
              );
            }
            // Check green risk level
            if (
              !isAmberRisk &&
              !isRedRisk &&
              medicalAlertSettings.greenRiskApplicability
            ) {
              patientRisk.green = patientRisk.green + 1;
              if (!flagAdded) {
                patientRisk.vitalRisk.push({
                  vitalSignId: vitalSignsSettings[vitalSign].vitalSignId,
                  riskLevel: RiskLevel.GREEN,
                });
              }
            }
            if (
              !patientRisk.latestReading &&
              vitalReadings[vitalReadings.length - 1] !== -1
            ) {
              // Check for any valid readings on the latest hour(on any vital signs)
              patientRisk.latestReading = true;
            }
          } // End of validating vital readings
        } // ENd for checking vital sign in Trends response
      });
      return patientRisk;
    } catch (error) {
      throw error;
    }
  }

  private updatePatientRiskAndGetRiskStatus(
    riskLevel: RiskLevel.RED | RiskLevel.AMBER,
    patientRisk: IPatientRiskLevels,
    vitalReadings: number[],
    vitalSignSettings: IVitalSignSettings,
    medicalAlertSettings: MedicalAlertSettings,
    isFlagCheckRequired = true,
  ): boolean[] {
    try {
      let [isRisk, flagAdded] = [false, false];
      let riskSettings;
      switch (riskLevel) {
        case RiskLevel.AMBER:
          riskSettings = {
            riskApplicability: medicalAlertSettings.amberRiskApplicability,
            riskReadingOutOf: medicalAlertSettings.amberRiskReadingOutOf,
            riskReadingChoice: medicalAlertSettings.amberRiskReadingChoice,
          };
          break;
        case RiskLevel.RED:
          riskSettings = {
            riskApplicability: medicalAlertSettings.redRiskApplicability,
            riskReadingOutOf: medicalAlertSettings.redRiskReadingOutOf,
            riskReadingChoice: medicalAlertSettings.redRiskReadingChoice,
          };
          break;
      }
      if (riskSettings.riskApplicability) {
        // construct the required length of readings array from total readings
        const requiredVitalReadings =
          vitalReadings.length > riskSettings.riskReadingOutOf
            ? vitalReadings.slice(
                vitalReadings.length - riskSettings.riskReadingOutOf,
              )
            : vitalReadings;
        // check risk level of vital sign
        isRisk = this.checkVitalReadingsRiskLevel(
          requiredVitalReadings,
          riskLevel,
          vitalSignSettings,
          riskSettings.riskReadingChoice,
        );
        if (isRisk) {
          patientRisk[riskLevel] = patientRisk[riskLevel] + 1;
        }
      } else {
        // Disabled risk level
      }
      // add vital risk flags(without considering risk level)
      // latest valid datapoint will be used for finding risk flag
      // if (
      //   vitalReadings &&
      //   vitalReadings.length > 0 &&
      //   vitalReadings[vitalReadings.length - 1] &&
      //   isFlagCheckRequired
      // ) {
      //   const isVitalRisk = this.checkVitalReadingsRiskLevel(
      //     [vitalReadings[vitalReadings.length - 1]],
      //     riskLevel,
      //     vitalSignSettings,
      //     1,
      //   );
      //   if (isVitalRisk) {
      //     patientRisk.vitalRisk.push({
      //       vitalSignId: vitalSignSettings.vitalSignId,
      //       riskLevel,
      //     });
      //     flagAdded = true;
      //   }
      // }
      if (isFlagCheckRequired) {
        flagAdded = this.updatePatientRiskFlag(
          riskLevel,
          patientRisk,
          vitalReadings,
          vitalSignSettings,
        );
      }
      return [isRisk, flagAdded];
    } catch (error) {
      throw error;
    }
  }

  private updatePatientRiskFlag(
    riskLevel: RiskLevel.RED | RiskLevel.AMBER,
    patientRisk: IPatientRiskLevels,
    vitalReadings: number[],
    vitalSignSettings: IVitalSignSettings,
  ): boolean {
    try {
      // add vital risk flag for latest valid reading
      // latest valid datapoint will be used for finding risk flag
      let flagAdded = false;
      if (
        vitalReadings &&
        vitalReadings.length > 0 &&
        vitalReadings[vitalReadings.length - 1]
      ) {
        const isVitalRisk = this.checkVitalReadingsRiskLevel(
          [vitalReadings[vitalReadings.length - 1]],
          riskLevel,
          vitalSignSettings,
          1,
        );
        if (isVitalRisk) {
          patientRisk.vitalRisk.push({
            vitalSignId: vitalSignSettings.vitalSignId,
            riskLevel,
          });
          flagAdded = true;
        }
      }
      return flagAdded;
    } catch (error) {
      throw error;
    }
  }

  async patientHistoryRisk(
    patientId: string,
    patientVitalRisks: IPatientVitalRisks[],
    riskLevel: RiskLevel,
    resolutionType: ResolutionType,
  ): Promise<any> {
    try {
      // const startDateInit = new Date(new Date().setSeconds(0));
      // let endDate = new Date(startDateInit.setMinutes(0));
      // let startDate = new Date(
      //   startDateInit.setHours(startDateInit.getHours() - 1),
      // );
      // if (resolutionType == ResolutionType.DAILY) {
      //   endDate = new Date(startDateInit.setHours(0));
      //   startDate = new Date(
      //     startDateInit.setDate(startDateInit.getDate() - 1),
      //   );
      // }
      const today = new Date();
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        today.getHours(),
        0,
        0,
        0,
      );
      let endDate;
      if (resolutionType == ResolutionType.DAILY) {
        endDate = new Date(startDate).setDate(startDate.getDate() + 1);
        endDate = new Date(endDate).setHours(0);
      } else {
        endDate = new Date(startDate).setHours(startDate.getHours() + 1);
      }
      const patientMedicalRisk = await this.patientMedicalRiskHistoryModelService.createMany(
        [
          {
            patientId: patientId,
            riskLevel: riskLevel,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            resolutionType: resolutionType,
          },
        ],
      );

      const patientVitalRiskHistory = patientVitalRisks.map((element) => {
        return {
          vitalSignId: element.vitalSignId,
          riskLevel: element.riskLevel,
          patientMedicalRiskHistoryId: patientMedicalRisk[0].id,
        };
      });

      await this.patientVitalRiskHistoryModelService.createMany(
        patientVitalRiskHistory,
      );

      return true;
    } catch (err) {
      throw err;
    }
  }
}
