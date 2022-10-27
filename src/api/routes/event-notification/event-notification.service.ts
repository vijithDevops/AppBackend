import { ConfigService } from '@nestjs/config';
import { User } from 'src/models/user/entity/user.entity';
import {
  getTimeDurationString,
  getTimezoneLocalTime,
  getTimezoneOffset,
} from './../../../common/utils/date_helper';
import { DataProcessingServerService } from './../../../services/data-processing-server/data-processing-server.service';
import { UserModelService } from 'src/models/user/user.model.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationService } from 'src/services/notification/notification.service';
import {
  AppointmentType,
  UserAppointmentStatus,
} from '../../../models/appointment/entity/appointment.enum';
import { NOTIFICATION_EVENTS } from '../../../config/master-data-constants';
import { AppointmentStatus } from '../../../models/appointment/entity/appointment.enum';
import { geStartOfDayUTCDate } from '../../../common/utils/date_helper';
import { AppointmentModelService } from '../../../models/appointment/appointment.model.service';
import { NotificationReminderModelService } from '../../../models/notification_reminder/notification_reminder.model.service';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { EventSchedulerService } from 'src/services/event-scheduler/event-scheduler.service';
import { NotificationReminder } from 'src/models/notification_reminder/entity/notification_reminder.entity';
import { OrganizationModelService } from 'src/models/organization/organization.model.service';
import { EmailService } from 'src/services/email/email.service';
import { Role } from 'src/models/user/entity/user.enum';
import { PATIENT_APPOINTMENT_REMINDER_BODY } from 'src/config/constants';

@Injectable()
export class EventNotificationService {
  constructor(
    private readonly appointmentModelService: AppointmentModelService,
    private readonly notificationReminderModelService: NotificationReminderModelService,
    private readonly notificationService: NotificationService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly organizationModelService: OrganizationModelService,
    private readonly userModelService: UserModelService,
    private readonly dataProcessingServerService: DataProcessingServerService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendAppointmentReminderNotification(reminderId: string) {
    try {
      const appointment = await this.appointmentModelService.findOneByReminderId(
        reminderId,
      );
      if (appointment.status === AppointmentStatus.CONFIRMED) {
        const notifiersId = [appointment.patient.id];
        const notifyUserNames = [appointment.doctor.username];
        let participantNameString = `${appointment.doctor.username}, ${appointment.patient.username}`;
        appointment.appointmentUsers.forEach((user) => {
          if (
            user.userId !== appointment.patient.id &&
            user.userId !== appointment.doctor.id
            // user.status === UserAppointmentStatus.ACCEPTED
          ) {
            notifiersId.push(user.userId);
            notifyUserNames.push(user.user.username);
            // if (participantNameString === '') {
            //   participantNameString = `${user.user.username}`;
            // } else {
            // }
            participantNameString =
              participantNameString + `, ${user.user.username}`;
          }
        });
        const reminderMessage = await this.notificationService.createNotificationMessage(
          {
            ...NOTIFICATION_EVENTS.APPOINTMENT_USERS_REMINDER,
            notificationType: NotificationType.PUSH,
          },
          {
            DOCTOR: appointment.doctor.firstName,
            DATE: appointment.startTime,
            LOCATION:
              appointment.type === AppointmentType.FACE_TO_FACE
                ? 'Hospital'
                : 'Video Call',
          },
        );
        const doctorReminderMessage = await this.notificationService.createNotificationMessage(
          {
            ...NOTIFICATION_EVENTS.APPOINTMENT_DOCTOR_REMINDER,
            notificationType: NotificationType.PUSH,
          },
          {
            PATIENT:
              appointment.patient.firstName || appointment.patient.username,
            DATE: appointment.startTime,
            LOCATION:
              appointment.type === AppointmentType.FACE_TO_FACE
                ? 'Hospital'
                : 'Video Call',
          },
        );
        //notification to patient and other users
        this.notificationService.generateNotification(
          {
            ...reminderMessage,
            actorId: appointment.doctor.id,
            payload: {
              appointemntId: appointment.id,
            },
          },
          notifiersId,
          NOTIFICATION_EVENTS.APPOINTMENT_USERS_REMINDER,
        );
        //notification to doctor
        this.notificationService.generateNotification(
          {
            ...doctorReminderMessage,
            actorId: appointment.patient.id,
            payload: {
              appointemntId: appointment.id,
            },
          },
          [appointment.doctor.id],
          NOTIFICATION_EVENTS.APPOINTMENT_DOCTOR_REMINDER,
        );
        const startTimeString = getTimezoneLocalTime(
          appointment.startTime,
          appointment.organization.timezone,
        );
        const [startDate, startTime] = startTimeString.split(',');
        const emailContext = {
          title: appointment.title || ' ',
          patientName:
            appointment.patient.firstName || appointment.patient.username,
          date: startDate,
          startTime: startTime,
          mode: appointment.type.replace(/_/g, ' '),
          duration: getTimeDurationString(
            appointment.startTime,
            appointment.endTime,
          ),
          participants: participantNameString,
          joinLink: null,
          joinText: null,
        };
        appointment.appointmentUsers.forEach((user) => {
          if (user.user.email) {
            const userName =
              this.getUserFullName(user.user) || user.user.username;
            if (appointment.type === AppointmentType.VIDEO_CALL) {
              if (user.user.role === Role.PATIENT) {
                emailContext.joinText = PATIENT_APPOINTMENT_REMINDER_BODY;
              } else {
                emailContext.joinLink = `${this.configService.get(
                  'WEB_APP_URL',
                )}/videoChat/${appointment.id}`;
              }
            }
            // send Email notification
            this.emailService.sendEmail({
              to: [user.user.email],
              subject: doctorReminderMessage.messageTitle,
              templateName: 'appointment_reminder.ejs',
              context: { ...emailContext, name: userName },
            });
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async sendReminderNotification(reminderId: string) {
    try {
      const reminder = await this.notificationReminderModelService
        .getNotificationReminderBySchedulerId(reminderId)
        .catch((err) => {
          throw new BadRequestException(err.message);
        });
      if (reminder.isActive) {
        if (reminder.isDefault) {
          this.sendDefaultReminderNotification(reminder);
        } else {
          this.sendCustomReminderNotification(reminder);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  getUserFullName(user: User) {
    try {
      return user.firstName
        ? user.firstName
        : '' + user.middleName
        ? user.middleName
        : '' + user.lastName
        ? user.lastName
        : '';
    } catch (error) {
      throw error;
    }
  }

  async sendDefaultReminderNotification(reminder: NotificationReminder) {
    let notificationEvent;
    switch (reminder.type) {
      case ReminderEvent.MEDICATION_REMINDER:
        notificationEvent = NOTIFICATION_EVENTS.DEFAULT_MEDICATION_REMINDER;
        break;
      case ReminderEvent.BREATHING_EXERCISE_REMINDER:
        notificationEvent =
          NOTIFICATION_EVENTS.DEFAULT_BREATHING_EXERCISE_REMINDER;
        break;
      case ReminderEvent.SENSOR_USE_REMINDER:
        notificationEvent = NOTIFICATION_EVENTS.SENSOR_USE_REMINDER;
        break;
      case ReminderEvent.HEALTH_INPUT_REMINDER:
        notificationEvent = NOTIFICATION_EVENTS.HEALTH_INPUT_REMINDER;
        break;
    }
    const reminderMessage = await this.notificationService.createNotificationMessage(
      {
        ...notificationEvent,
        notificationType: NotificationType.PUSH,
      },
      {
        NAME: reminder.patient.firstName,
      },
    );
    //notification to patient
    this.notificationService.generateNotification(
      {
        ...reminderMessage,
        actorId: reminder.patientId,
        payload: {
          reminderId: reminder.id,
          type: reminder.type,
          isDefault: reminder.isDefault,
          medicationPrescriptionId: reminder.medicationPrescriptionId,
          breathingPrescriptionId: reminder.breathingPrescriptionId,
        },
      },
      [reminder.patientId],
      notificationEvent,
    );
  }

  async sendCustomReminderNotification(reminder: NotificationReminder) {
    let prescription;
    let notificationEvent;
    const messageReplaceValues = {
      NAME: reminder.patient.firstName,
    };
    switch (reminder.type) {
      case ReminderEvent.MEDICATION_REMINDER:
        prescription = reminder.medicationPrescription;
        notificationEvent = NOTIFICATION_EVENTS.CUSTOM_MEDICATION_REMINDER;
        // messageReplaceValues['INTAKE_COUNT'] =
        //   reminder.medicationPrescription.dosePerIntake;
        // messageReplaceValues['MEDICINE_NAME'] =
        //   reminder.medicationPrescription.name;
        break;
      case ReminderEvent.BREATHING_EXERCISE_REMINDER:
        prescription = reminder.breatingExercisePrescription;
        notificationEvent =
          NOTIFICATION_EVENTS.CUSTOM_BREATHING_EXERCISE_REMINDER;
        messageReplaceValues['PRESCRIPTION'] =
          reminder.breatingExercisePrescription.prescription;
        break;
    }
    const prescriptionStartDate = prescription.startDate
      ? new Date(prescription.startDate)
      : null;
    const prescriptionEndDate = prescription.endDate
      ? new Date(prescription.endDate)
      : null;
    const currentDate = geStartOfDayUTCDate(new Date());
    if (
      (prescriptionStartDate ? prescriptionStartDate <= currentDate : true) &&
      (prescriptionEndDate ? currentDate <= prescriptionEndDate : true)
    ) {
      const reminderMessage = await this.notificationService.createNotificationMessage(
        {
          ...notificationEvent,
          notificationType: NotificationType.PUSH,
        },
        messageReplaceValues,
      );
      //notification to patient
      this.notificationService.generateNotification(
        {
          ...reminderMessage,
          actorId: reminder.patientId,
          payload: {
            reminderId: reminder.id,
            type: reminder.type,
            isDefault: reminder.isDefault,
            medicationPrescriptionId: reminder.medicationPrescriptionId,
            breathingPrescriptionId: reminder.breathingPrescriptionId,
          },
        },
        [reminder.patientId],
        notificationEvent,
      );
    }
  }

  async triggerCacheUpdateOnDataServer(schedulerId: string) {
    const organization = await this.organizationModelService.getOrganizationByCacheUpdateSchedulerId(
      schedulerId,
    );
    if (organization) {
      const patientIntIds = await this.userModelService.getAllPatientIntegerIdsInOrganization(
        organization.id,
      );
      this.dataProcessingServerService.updatePatientListCache({
        ids: patientIntIds,
        date_time: new Date(),
        utc_offset: getTimezoneOffset(organization.timezone), // chnage timezone to offset value
      });
    }
  }
}
