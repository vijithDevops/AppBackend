import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  ICreatePatientDefaultReminder,
  ICreateRemindertimes,
  IDefaultReminderTimesObject,
  IReminderTime,
} from './interfaces';
import { DAILY_REMINDER } from 'src/services/event-scheduler/event-scheduler.enum';
import { BreatingExercisePrescriptionModelService } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.service';
import { MedicationPrescriptionModelService } from '../../../models/medication_prescription/medication_prescription.model.service';
import { NotificationReminder } from 'src/models/notification_reminder/entity/notification_reminder.entity';
import { EventSchedulerService } from 'src/services/event-scheduler/event-scheduler.service';
import { CreateNotificationReminderDto } from './dto';
import { ReminderEvent } from 'src/models/notification_reminder/entity/notification_reminder.enum';
import { NotificationReminderModelService } from 'src/models/notification_reminder/notification_reminder.model.service';
import { NotificationReminderTime } from 'src/models/notification_reminder/entity/notification_reminder_time.entity';
import { LogService } from 'src/services/logger/logger.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { PatientReminders } from 'src/models/notification_reminder/entity/patient_reminders.view.entity';
import { Organization } from 'src/models/organization/entity/organization.entity';

@Injectable()
export class NotificationReminderService {
  constructor(
    private readonly medicationPrescriptionModelService: MedicationPrescriptionModelService,
    private readonly breatingExercisePrescriptionModelService: BreatingExercisePrescriptionModelService,
    private readonly notificationReminderModelService: NotificationReminderModelService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly notificationService: NotificationService,
    private logService: LogService,
  ) {}

  async validatePatientPrescription(body: CreateNotificationReminderDto) {
    switch (body.type) {
      case ReminderEvent.MEDICATION_REMINDER:
        const medicationPrescription = await this.medicationPrescriptionModelService.findOne(
          body.medicationPrescriptionId,
          body.patientId,
        );
        if (!medicationPrescription.isActive) {
          throw new BadRequestException(
            'Reminder cannot be added for disabled prescription',
          );
        }
        if (!medicationPrescription) {
          throw new BadRequestException(
            'Invalid medication prescription for patient',
          );
        }
        break;
      case ReminderEvent.BREATHING_EXERCISE_REMINDER:
        const breathingPrescription = await this.breatingExercisePrescriptionModelService.findOne(
          body.breathingPrescriptionId,
          body.patientId,
        );
        if (!breathingPrescription) {
          throw new BadRequestException(
            'Invalid breathing prescription for patient',
          );
        }
        break;
    }
  }

  async scheduleReminderTimes(reminderTimes: NotificationReminderTime[]) {
    reminderTimes.forEach((time) => {
      if (!time.isDefault) {
        //TODO: //Schedule and update the reminderTime
      }
    });
  }

  async scheduleAndCreateReminderTimesObject(
    notificationReminder: NotificationReminder,
    reminderTimes: ICreateRemindertimes[],
  ) {
    try {
      const createReminderTimesPromises = reminderTimes.map(async (time) => {
        const schedulerId =
          time.isDefault === false
            ? await this.scheduleNotificationReminder(
                notificationReminder.type,
                time.hour,
                time.minute,
              ).catch(async (err) => {
                this.logService.logError(
                  `Failed to schedule and create reminder time for : ${notificationReminder.type} with ${time}`,
                  err,
                );
                throw err;
              })
            : null;
        return {
          ...time,
          notificationReminderId: notificationReminder.id,
          schedulerId: schedulerId,
        };
      });
      return await Promise.all(createReminderTimesPromises);
    } catch (error) {
      throw error;
    }
  }

  async scheduleNotificationReminder(
    type: ReminderEvent,
    hour: number,
    minute: number,
  ) {
    let reminderType: DAILY_REMINDER;
    switch (type) {
      case ReminderEvent.MEDICATION_REMINDER:
        reminderType = DAILY_REMINDER.MEDICATION_REMINDER;
        break;
      case ReminderEvent.BREATHING_EXERCISE_REMINDER:
        reminderType = DAILY_REMINDER.BREATHING_EXERCISE_REMINDER;
        break;
      case ReminderEvent.SENSOR_USE_REMINDER:
        reminderType = DAILY_REMINDER.SENSOR_USE_REMINDER;
        break;
      case ReminderEvent.HEALTH_INPUT_REMINDER:
        reminderType = DAILY_REMINDER.HEALTH_INPUT_REMINDER;
        break;
    }
    return await this.eventSchedulerService
      .createDailyReminder({
        type: reminderType,
        remindAtHour: hour,
        remindAtMinute: minute,
        payload: {},
        reminderOptions: { skipImmediate: true },
      })
      .catch((err) => {
        this.logService.logError('Failed to Schedule reminder', err);
        throw err;
      });
  }

  async updateNotifcationReminderTimes(
    notificationReminder: NotificationReminder,
    reminderTimesDto: ICreateRemindertimes[],
  ) {
    try {
      await this.deleteReminderTimes(notificationReminder.reminderTimes).catch(
        (err) => {
          this.logService.logError(
            `Failed to delete reminderTimes on updateNotifcationReminderTimes for ${notificationReminder.id}`,
            err,
          );
          throw new HttpException(
            'Sorry we are Experiencing technical issues. Please try later',
            HttpStatus.FAILED_DEPENDENCY,
          );
        },
      );
      const reminderTimes = await this.createReminderTimes(
        notificationReminder,
        reminderTimesDto,
      );
      return { ...notificationReminder, reminderTimes: reminderTimes };
    } catch (error) {
      throw error;
    }
  }

  async createPatientDefaultReminder(createDto: ICreatePatientDefaultReminder) {
    try {
      const notificationReminder = await this.notificationReminderModelService.createnotificationReminder(
        {
          patientId: createDto.patientId,
          type: createDto.type,
          isActive: createDto.isActive,
          isDefault: true,
        },
      );
      const reminderTimes = await this.createReminderTimes(
        notificationReminder,
        createDto.reminderTimes,
      ).catch(async () => {
        await this.notificationReminderModelService.deleteReminderById(
          notificationReminder.id,
        );
        throw new HttpException(
          'Sorry we are Experiencing technical issues. Please try later',
          HttpStatus.FAILED_DEPENDENCY,
        );
      });
      return { ...notificationReminder, reminderTimes: reminderTimes };
    } catch (error) {
      throw error;
    }
  }

  async createPatientCustomReminder(createDto: CreateNotificationReminderDto) {
    try {
      const { reminderTimes: reminderTimesDto, ...reminderDto } = createDto;
      const notificationReminder = await this.notificationReminderModelService.createnotificationReminder(
        {
          ...reminderDto,
          isDefault: false,
        },
      );
      const reminderTimes = await this.createReminderTimes(
        notificationReminder,
        reminderTimesDto,
      );
      return { ...notificationReminder, reminderTimes: reminderTimes };
    } catch (error) {
      throw error;
    }
  }

  async createReminderTimes(
    notificationReminder: NotificationReminder,
    reminderTimes: ICreateRemindertimes[],
  ) {
    try {
      const createReminderTimesDto = await Promise.all(
        reminderTimes.map(async (time) => {
          const schedulerId = !time.isDefault
            ? await this.scheduleNotificationReminder(
                notificationReminder.type,
                time.hour,
                time.minute,
              ).catch(async (err) => {
                this.logService.logError(
                  `Failed to schedule and create reminder time for : ${notificationReminder.type} with ${time}`,
                  err,
                );
                throw err;
              })
            : null;
          return {
            hour: time.hour,
            minute: time.minute,
            isUTC: time.isUTC,
            isDefault: time.isDefault,
            notificationReminderId: notificationReminder.id,
            schedulerId: schedulerId,
          };
        }),
      );
      return await this.notificationReminderModelService.createnotificationReminderTime(
        createReminderTimesDto,
      );
    } catch (error) {
      throw error;
    }
  }

  async validateAndGetReminder(id: string) {
    const reminderData = await this.notificationReminderModelService.findOneDetailsById(
      id,
    );
    if (!reminderData) {
      throw new HttpException('Invalid reminder', HttpStatus.BAD_REQUEST);
    }
    return reminderData;
  }

  async deleteNotificationReminder(notificationReminder: NotificationReminder) {
    try {
      await this.deleteReminderTimes(notificationReminder.reminderTimes).catch(
        (err) => {
          this.logService.logError(
            `Failed to delete reminderTimes on deleteNotificationReminder for ${notificationReminder.id}`,
            err,
          );
          throw new HttpException(
            'Sorry we are Experiencing technical issues. Please try later',
            HttpStatus.FAILED_DEPENDENCY,
          );
        },
      );
      return await this.notificationReminderModelService.deleteReminderById(
        notificationReminder.id,
      );
    } catch (error) {
      throw error;
    }
  }

  private async deleteReminderTimes(
    reminderTimes: NotificationReminderTime[],
  ): Promise<void> {
    try {
      const deleteReminderPromise = [];
      const existingTimeIds = reminderTimes.map((time) => {
        if (time.schedulerId) {
          deleteReminderPromise.push(
            this.eventSchedulerService
              .deleteReminder(time.schedulerId)
              .catch((err) => {
                this.logService.logError(
                  `Failed to delete reminder scheduler for ${time}`,
                  err,
                );
                throw err;
              }),
          );
        }
        return time.id;
      });
      if (deleteReminderPromise.length > 0) {
        await Promise.all(deleteReminderPromise);
      }
      await this.notificationReminderModelService.deleteReminderTimesbyId(
        existingTimeIds,
      );
    } catch (error) {
      throw error;
    }
  }

  validateAndGetUpdateReminderTimes(
    previousReminderTimes: IReminderTime[],
    updateReminderTimesDto: ICreateRemindertimes[],
    defaultRemindeTimes: IReminderTime[],
  ): { updateRequired: boolean; createReminderTime: ICreateRemindertimes[] } {
    let updateRequired = false;
    const previousreminderTimesObj = {};
    const defaultReminderTimesObj = {};
    previousReminderTimes.forEach((previousTime) => {
      previousreminderTimesObj[
        `${previousTime.hour}:${previousTime.minute}`
      ] = previousTime;
    });
    defaultRemindeTimes.forEach((defaultTime) => {
      defaultReminderTimesObj[
        `${defaultTime.hour}:${defaultTime.minute}`
      ] = defaultTime;
    });
    const createReminderTime = updateReminderTimesDto.map((time) => {
      const defaultTime = defaultReminderTimesObj[`${time.hour}:${time.minute}`]
        ? defaultReminderTimesObj[`${time.hour}:${time.minute}`]
        : null;
      if (!previousreminderTimesObj[`${time.hour}:${time.minute}`]) {
        updateRequired = true;
      }
      return {
        hour: time.hour,
        minute: time.minute,
        isUTC: time['isUTC'] !== undefined && !time.isUTC ? false : true,
        isDefault:
          !time.isUTC && defaultTime && defaultTime.isDefault
            ? defaultTime.isDefault
            : false,
      };
    });
    if (createReminderTime.length != previousReminderTimes.length) {
      updateRequired = true;
    }
    return { updateRequired, createReminderTime };
  }

  private async getDefaultReminderOfPatients(
    reminderTime: IReminderTime,
    reminderTypes: ReminderEvent[],
    organizationId?: string,
  ): Promise<{ [key: string]: PatientReminders[] }> {
    try {
      const defaultReminders = await this.notificationReminderModelService.getPatientsDefaultRemindersByTimeAndType(
        reminderTime,
        reminderTypes,
        organizationId,
      );
      const defaultReminderObject = reminderTypes.reduce(
        (a, key) => Object.assign(a, { [key]: [] }),
        {},
      );
      defaultReminders.forEach((reminder) => {
        defaultReminderObject[reminder.type].push(reminder);
      });
      return defaultReminderObject;
    } catch (error) {
      throw error;
    }
  }

  private getDefaultNotificationEventByType(type: ReminderEvent) {
    switch (type) {
      case ReminderEvent.MEDICATION_REMINDER:
        return NOTIFICATION_EVENTS.DEFAULT_MEDICATION_REMINDER;
      case ReminderEvent.BREATHING_EXERCISE_REMINDER:
        return NOTIFICATION_EVENTS.DEFAULT_BREATHING_EXERCISE_REMINDER;
      case ReminderEvent.SENSOR_USE_REMINDER:
        return NOTIFICATION_EVENTS.SENSOR_USE_REMINDER;
      case ReminderEvent.HEALTH_INPUT_REMINDER:
        return NOTIFICATION_EVENTS.HEALTH_INPUT_REMINDER;
    }
  }

  async sendDefaultReminderNotification(
    reminderTime: IReminderTime,
    reminderTypes: ReminderEvent[],
    organizationId?: string,
  ) {
    try {
      const defaultReminders = await this.getDefaultReminderOfPatients(
        reminderTime,
        reminderTypes,
        organizationId,
      );
      const reminderNotificationPromise = reminderTypes.map(async (type) => {
        const notificationEvent = this.getDefaultNotificationEventByType(type);
        if (defaultReminders[type] && defaultReminders[type].length > 0) {
          const patientNotifierPromise = defaultReminders[type].map(
            async (patientReminder) => {
              const reminderMessage = await this.notificationService.createNotificationMessage(
                {
                  ...notificationEvent,
                  notificationType: NotificationType.PUSH,
                },
                {
                  NAME: patientReminder.patient.firstName,
                },
              );
              //notification to patient
              this.notificationService
                .generateNotification(
                  {
                    ...reminderMessage,
                    actorId: patientReminder.patient.id,
                    payload: {
                      reminderId: patientReminder.id,
                      type: type,
                      isDefault: true,
                      medicationPrescriptionId: null,
                      breathingPrescriptionId: null,
                    },
                  },
                  [patientReminder.patient.id],
                  notificationEvent,
                )
                .catch((err) => {
                  this.logService.logError(
                    `Failed to send Default reminder to ${patientReminder.patient.username}`,
                    err,
                  );
                  throw err;
                });
              return 'Success';
            },
          );
          return await Promise.all(patientNotifierPromise);
        }
      });
      const reminderNotification = await Promise.all(
        reminderNotificationPromise,
      );
      this.logService.logInfo(
        `Successfully send Default reminder at ${reminderTime.hour}:${reminderTime.minute}`,
        reminderNotification,
      );
    } catch (error) {
      throw error;
    }
  }

  async scheduleDefaultRemindesForOrganziation(organization: Organization) {
    try {
      const reminderTimesObject = await this.getDefaultReminderTimesObject();
      this.logService.logInfo(
        `Scheduling daily default for Organization ${organization.name}`,
        { id: organization.id },
      );
      Object.keys(reminderTimesObject).forEach(async (timeString) => {
        const reminder = reminderTimesObject[timeString];
        const schedulerId = await this.eventSchedulerService.createDailyDefaultReminder(
          {
            hour: reminder.hour,
            minute: reminder.minute,
            payload: {
              organizationId: organization.id,
              ...reminder,
            },
            options: {
              timezone: organization.timezone,
            },
          },
        );
        this.logService.logInfo(
          `Scheduled daily default at ${timeString} for organization ${organization.name}`,
          { id: organization.id, schedulerId },
        );
      });
    } catch (error) {
      throw error;
    }
  }

  async resetAllOrganizationDefaultReminders(organizations: Organization[]) {
    try {
      const reminderTimesObject = await this.getDefaultReminderTimesObject();
      await this.deleteDefaultRemindersOfAllOrganization();
      organizations.forEach((organization) => {
        Object.keys(reminderTimesObject).forEach(async (timeString) => {
          const reminder = reminderTimesObject[timeString];
          await this.eventSchedulerService.createDailyDefaultReminder({
            hour: reminder.hour,
            minute: reminder.minute,
            payload: {
              organizationId: organization.id,
              ...reminder,
            },
            options: {
              timezone: organization.timezone,
            },
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async getDefaultReminderTimesObject(): Promise<IDefaultReminderTimesObject> {
    try {
      const reminderTimes = await this.notificationReminderModelService.getAllDefaultRemindersTimes();
      const reminderTimesObject = {};
      reminderTimes.forEach((time) => {
        const timeString = `${time.hour}:${time.minute}`;
        if (reminderTimesObject[timeString]) {
          reminderTimesObject[timeString].types.push(
            time.notificationReminder.type,
          );
        } else {
          reminderTimesObject[timeString] = {
            hour: time.hour,
            minute: time.minute,
            types: [time.notificationReminder.type],
          };
        }
      });
      return reminderTimesObject;
    } catch (error) {
      throw error;
    }
  }

  async deleteOrganizationDefaultReminders(organization: Organization) {
    try {
      this.logService.logInfo(
        `Deleting daily default reminders for Organization "${organization.name}"`,
        { id: organization.id },
      );
      await this.eventSchedulerService.deleteAllDefaultReminbersOfOrganization(
        organization.id,
      );
      this.logService.logInfo(
        `Deleted all daily default reminders for Organization "${organization.name}"`,
        { id: organization.id },
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteDefaultRemindersOfAllOrganization() {
    try {
      await this.eventSchedulerService.deleteAllDailyDefaultReminders();
    } catch (error) {
      throw error;
    }
  }
}
