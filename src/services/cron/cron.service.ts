import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogService } from '../logger/logger.service';
import { UserModelService } from '../../models/user/user.model.service';
import { PatientAlertSettingsModelService } from '../../models/patient_alert_settings/patient_alert_settings.model.service';
import { PatientAlertService } from '../patient-alerts/patient-alert.service';
import {
  // ALERT_TYPE,
  // APP_SERVER_PATIENT_ALERTS,
  NOTIFICATION_EVENT,
  // PATIENT_DAILY_BASED_INPUTS,
  // PATIENT_PRESCRIPTION_BASED_INPUTS,
} from '../../config/master-data-constants';
import { AppointmentModelService } from '../../models/appointment/appointment.model.service';
import { AppointmentStatus } from 'src/models/appointment/entity/appointment.enum';
import {
  CRON_DELETE_EXPIRED_NOTIFICATIONS_AT,
  CRON_UPDATE_EXPIRED_APPOINTMENTS_BUFFER,
} from 'src/config/constants';
import { NotificationModelService } from '../../models/notification/notification.model.service';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';
import { NotificationReminderService } from '../../api/routes/notification-reminder/notification-reminder.service';

@Injectable()
export class CronService {
  constructor(
    private logService: LogService,
    private readonly userModelService: UserModelService,
    private readonly patientAlertSettingsModelService: PatientAlertSettingsModelService,
    private readonly patientAlertService: PatientAlertService,
    private readonly appointmentModelService: AppointmentModelService,
    private readonly notificationModelService: NotificationModelService,
    private readonly notificationReminderService: NotificationReminderService,
  ) {
    this.logService.setContext('CronService');
  }

  // Cron runs every minute
  @Cron('* * * * *')
  async updateAppointmentStatuses() {
    this.logService.logInfo('Cron running to update appointments');
    const [updateInProgress, updateCompleted] = await Promise.all([
      this.appointmentModelService.updateAppointmentStatus(
        [AppointmentStatus.CONFIRMED],
        AppointmentStatus.IN_PROGRESS,
        { startTimeLessThanOrEqualTo: new Date() },
      ),
      this.appointmentModelService.updateAppointmentStatus(
        [AppointmentStatus.IN_PROGRESS],
        AppointmentStatus.COMPLETED,
        { endTimeLessThanOrEqualTo: new Date() },
      ),
      this.updateExpiredAppointments(),
    ]);
    this.logService.logInfo(
      `updated ${AppointmentStatus.CONFIRMED} appointment to ${AppointmentStatus.IN_PROGRESS}: `,
      updateInProgress,
    );
    this.logService.logInfo(
      `updated ${AppointmentStatus.IN_PROGRESS} appointment to ${AppointmentStatus.COMPLETED}: `,
      updateCompleted,
    );
  }

  // Cron runs every day at 00:00:00
  @Cron('00 00 * * *')
  async DailyBatchOperations() {
    this.logService.logInfo('Daily batch Cron is running...');
    // this.updateExpiredAppointments();
    this.deleteExpiredNotifications();
  }
  /* Function to delete all Expired notifications of users */
  async deleteExpiredNotifications() {
    this.logService.logInfo(
      'Cron function to delete Expired notifications is running',
    );
    const expiryTime = new Date();
    expiryTime.setHours(
      expiryTime.getHours() - CRON_DELETE_EXPIRED_NOTIFICATIONS_AT,
    );
    const expiredNotifications = await this.notificationModelService.getAllExpiredNonMedicalNotifications(
      expiryTime,
      {
        event: [
          NOTIFICATION_EVENT.ALERT,
          NOTIFICATION_EVENT.INVITE,
          NOTIFICATION_EVENT.MESSAGE,
          NOTIFICATION_EVENT.NOTIFY,
          NOTIFICATION_EVENT.REMINDER,
        ],
        acknowledgeRequired: false,
      },
    );
    const expiredEvents = expiredNotifications.map((notification) => {
      return notification.id;
    });
    let deletedCount = 0;
    if (expiredEvents.length > 0) {
      deletedCount = await this.notificationModelService.softDeleteNotificationsById(
        expiredEvents,
      );
    }
    this.logService.logInfo(`Deleted ${deletedCount} Expired events`);
  }

  /* Function to update all Pending appointments to Expired */
  async updateExpiredAppointments() {
    // this.logService.logInfo('Function running to update expired appointment ');
    const endTimeLessThan = new Date(
      new Date().getTime() - CRON_UPDATE_EXPIRED_APPOINTMENTS_BUFFER * 60000,
    );
    const [expiredAppointments] = await Promise.all([
      this.appointmentModelService.updateAppointmentStatus(
        [AppointmentStatus.PENDING],
        AppointmentStatus.EXPIRED,
        { endTimeLessThan },
      ),
    ]);
    this.logService.logInfo(
      `updated ${AppointmentStatus.PENDING} appointment to ${AppointmentStatus.EXPIRED}: `,
      expiredAppointments,
    );
  }

  // Cron runs every day at 12:00:00
  // @Cron('00 12 * * *')
  // async sendAlertForMissedPatientInputs() {
  //   this.logService.logInfo(
  //     'Cron running to send Alert for missed patient Inputs',
  //   );
  //   const patients = await this.userModelService.getAllPatientsAndAlertSettings();
  //   patients.forEach(async (patient) => {
  //     const patientAlertSettings =
  //       patient.patientAlertSettings &&
  //       Object.keys(patient.patientAlertSettings).length > 0
  //         ? patient.patientAlertSettings
  //         : await this.patientAlertSettingsModelService.findByPatientId(
  //             patient.id,
  //           );
  //     const [
  //       medicationInputAlert,
  //       breathingInputAlert,
  //       symptomsInputAlert,
  //       healthInputAlert,
  //     ] = await Promise.all([
  //       this.patientAlertService.getPatientPrescriptionBasedInputsMissedAlert(
  //         PATIENT_PRESCRIPTION_BASED_INPUTS.MEDICATION_INPUT,
  //         patient,
  //         patientAlertSettings,
  //       ),
  //       this.patientAlertService.getPatientPrescriptionBasedInputsMissedAlert(
  //         PATIENT_PRESCRIPTION_BASED_INPUTS.BREATHING_INPUT,
  //         patient,
  //         patientAlertSettings,
  //       ),
  //       this.patientAlertService.getPatientDailyBasedInputsMissedAlert(
  //         PATIENT_DAILY_BASED_INPUTS.SYMPTOMS_INPUT,
  //         patient,
  //         patientAlertSettings,
  //       ),
  //       this.patientAlertService.getPatientDailyBasedInputsMissedAlert(
  //         PATIENT_DAILY_BASED_INPUTS.HEALTH_INPUT,
  //         patient,
  //         patientAlertSettings,
  //       ),
  //     ]);
  //     if (medicationInputAlert.amberAlert || medicationInputAlert.redAlert) {
  //       this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
  //         patient,
  //         medicationInputAlert.redAlert
  //           ? ALERT_TYPE.RED_ALERT
  //           : ALERT_TYPE.AMBER_ALERT,
  //         APP_SERVER_PATIENT_ALERTS.MEDICATION_DAYS_MISSED,
  //       );
  //     }
  //     if (breathingInputAlert.amberAlert || breathingInputAlert.redAlert) {
  //       this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
  //         patient,
  //         medicationInputAlert.redAlert
  //           ? ALERT_TYPE.RED_ALERT
  //           : ALERT_TYPE.AMBER_ALERT,
  //         APP_SERVER_PATIENT_ALERTS.BREATHING_EXERCISE_DAYS_MISSED,
  //       );
  //     }
  //     if (symptomsInputAlert.amberAlert || symptomsInputAlert.redAlert) {
  //       this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
  //         patient,
  //         medicationInputAlert.redAlert
  //           ? ALERT_TYPE.RED_ALERT
  //           : ALERT_TYPE.AMBER_ALERT,
  //         APP_SERVER_PATIENT_ALERTS.SYMPTOMS_DAYS_MISSED,
  //       );
  //     }
  //     if (healthInputAlert.amberAlert || healthInputAlert.redAlert) {
  //       this.patientAlertService.sendAlertNotificationToPatientAndSupervisors(
  //         patient,
  //         medicationInputAlert.redAlert
  //           ? ALERT_TYPE.RED_ALERT
  //           : ALERT_TYPE.AMBER_ALERT,
  //         APP_SERVER_PATIENT_ALERTS.HEALTH_INPUTS_DAYS_MISSED,
  //       );
  //     }
  //   });
  //   this.logService.logInfo(
  //     `Successfully send Alerts to ${patients.length} patients`,
  //   );
  // }

  // Cron to send default reminder at 01:00:00
  // @Cron('00 1 * * *')
  // async defaultReminder1() {
  //   const reminderTime = {
  //     hour: 1,
  //     minute: 0,
  //     isDefault: true,
  //   };
  //   const reminderTypes = [
  //     ReminderEvent.MEDICATION_REMINDER,
  //     // ReminderEvent.BREATHING_EXERCISE_REMINDER,
  //     ReminderEvent.HEALTH_INPUT_REMINDER,
  //     ReminderEvent.SENSOR_USE_REMINDER,
  //   ];
  //   this.logService.logInfo(
  //     `Cron running to send default reminder for ${reminderTypes} at ${reminderTime}`,
  //   );
  //   this.notificationReminderService.sendDefaultReminderNotification(
  //     reminderTime,
  //     reminderTypes,
  //   );
  // }

  // // Cron to send default reminder at 11:00:00
  // @Cron('00 11 * * *')
  // async defaultReminder2() {
  //   const reminderTime = {
  //     hour: 11,
  //     minute: 0,
  //     isDefault: true,
  //   };
  //   const reminderTypes = [ReminderEvent.SENSOR_USE_REMINDER];
  //   this.logService.logInfo(
  //     `Cron running to send default reminder for ${reminderTypes} at ${reminderTime}`,
  //   );
  //   this.notificationReminderService.sendDefaultReminderNotification(
  //     reminderTime,
  //     reminderTypes,
  //   );
  // }
}
