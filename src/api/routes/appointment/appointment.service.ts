import { Role } from 'src/models/user/entity/user.enum';
import {
  HttpException,
  HttpStatus,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from '../../../models/appointment/entity/appointment.entity';
import {
  AppointmentStatus,
  UserAppointmentStatus,
} from '../../../models/appointment/entity/appointment.enum';
import { EventSchedulerService } from 'src/services/event-scheduler/event-scheduler.service';
import {
  NOTIFICATION_REMINDER_BEFORE,
  MINIMUM_APPOINTMENT_TIME,
  APPOINTMENT_START_BEFORE_MINUTES,
} from '../../../config/constants';
import { SCHEDULED_REMINDER } from '../../../services/event-scheduler/event-scheduler.enum';
import { AppointmentModelService } from 'src/models/appointment/appointment.model.service';
import { CreateAppointmentDto, getMonthlyCalendarAppointmentsDto } from './dto';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { UserAppointments } from 'src/models/appointment/entity/user_appointment.view.entity';
import { User } from 'src/models/user/entity/user.entity';
import { NotificationService } from 'src/services/notification/notification.service';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { UserModelService } from 'src/models/user/user.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { AppointmentUsers } from 'src/models/appointment/entity/appointment_users.entity';
const cryptoRandomString = require('crypto-random-string');

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentModelService: AppointmentModelService,
    private readonly calendarModelService: CalendarModelService,
    private readonly eventSchedulerService: EventSchedulerService,
    private readonly notificationService: NotificationService,
    private userModelService: UserModelService,
    private logService: LogService,
  ) {}

  validateUpdateAppointmentStatus(
    status: AppointmentStatus,
    appointment: Appointment,
    updateDto?: UpdateAppointmentDto,
  ): boolean {
    const previousStatus = appointment.status;
    switch (status) {
      case AppointmentStatus.PENDING:
        return (
          previousStatus === AppointmentStatus.PENDING ||
          previousStatus === AppointmentStatus.CANCELLED ||
          previousStatus === AppointmentStatus.REJECTED
        );
      case AppointmentStatus.CONFIRMED:
        return (
          previousStatus === AppointmentStatus.PENDING ||
          previousStatus === AppointmentStatus.CONFIRMED
        );
      case AppointmentStatus.REJECTED:
        return (
          previousStatus === AppointmentStatus.REJECTED ||
          previousStatus === AppointmentStatus.PENDING
        );
      case AppointmentStatus.CANCELLED:
        return (
          previousStatus === AppointmentStatus.CANCELLED ||
          previousStatus === AppointmentStatus.CONFIRMED ||
          previousStatus === AppointmentStatus.PENDING
        );
      case AppointmentStatus.IN_PROGRESS:
        return (
          previousStatus === AppointmentStatus.CONFIRMED ||
          previousStatus === AppointmentStatus.IN_PROGRESS ||
          (previousStatus === AppointmentStatus.COMPLETED &&
            new Date(
              updateDto && updateDto.endTime
                ? updateDto.endTime
                : appointment.endTime,
            ) > new Date())
        );
      case AppointmentStatus.COMPLETED:
        return (
          previousStatus === AppointmentStatus.CONFIRMED ||
          previousStatus === AppointmentStatus.IN_PROGRESS ||
          previousStatus === AppointmentStatus.COMPLETED
        );
      default:
        return false;
    }
  }

  validateUpdateUserAppointmentStatus(
    status: UserAppointmentStatus,
    previousStatus: UserAppointmentStatus,
  ): boolean {
    switch (status) {
      case UserAppointmentStatus.ACCEPTED:
        return (
          previousStatus === UserAppointmentStatus.PENDING ||
          previousStatus === UserAppointmentStatus.REJECTED
        );
      case UserAppointmentStatus.REJECTED:
        return (
          previousStatus === UserAppointmentStatus.PENDING ||
          previousStatus === UserAppointmentStatus.ACCEPTED
        );
      default:
        return false;
    }
  }

  async validateCreateAppointmentUsers(
    dto: CreateAppointmentDto,
  ): Promise<void> {
    try {
      const usersInfo = await this.userModelService.getUsersMinInfo([
        dto.patientId,
        dto.doctorId,
        ...dto.addUsers,
      ]);
      const userInfoObj = {};
      usersInfo.forEach((user) => {
        userInfoObj[`${user.id}`] = user;
      });
      if (
        !userInfoObj[dto.patientId] ||
        userInfoObj[dto.patientId].role !== Role.PATIENT ||
        userInfoObj[dto.patientId].organizationId !== dto.organizationId
      ) {
        throw new BadRequestException(
          'Invalid patient for appoitment in the organization',
        );
      }
      if (
        !userInfoObj[dto.doctorId] ||
        userInfoObj[dto.doctorId].role !== Role.DOCTOR ||
        userInfoObj[dto.doctorId].organizationId !== dto.organizationId
      ) {
        throw new BadRequestException(
          'Invalid doctor for appoitment in the organization',
        );
      }
      if (dto.addUsers && dto.addUsers.length > 0) {
        dto.addUsers.forEach((id) => {
          if (
            !userInfoObj[id] ||
            userInfoObj[id].organizationId !== dto.organizationId ||
            userInfoObj[id].role === Role.PATIENT ||
            id === dto.patientId ||
            id === dto.doctorId
          ) {
            throw new BadRequestException(
              'Invalid appointment users in the organziation',
            );
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async canPatientUpdateAppointment(
    patientId: string,
    appointment: Appointment,
    updateDto: UpdateAppointmentDto,
  ): Promise<boolean> {
    if (appointment.patientId !== patientId) {
      throw new ForbiddenException();
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new HttpException(
        `You cannot update a ${appointment.status} appointment`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    if (updateDto.status) {
      if (
        updateDto.status === AppointmentStatus.CANCELLED &&
        (await this.appointmentModelService.getAppointmetOrganizerId(
          appointment.id,
        )) === patientId
      ) {
        return true;
      } else {
        throw new HttpException(
          `You cannot update the appointment status`,
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }
    return true;
  }

  async sendAppointmentInvite(appointmentId: string, organizer: User) {
    const appointment = await this.appointmentModelService.findOne(
      appointmentId,
    );
    //send appointment invite notification
    const appointmentMessage = await this.notificationService.createNotificationMessage(
      {
        ...NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
        notificationType: NotificationType.PUSH,
      },
      { NAME: organizer.firstName },
    );
    const notifyUsers = [];
    const doctorInvite = [];
    appointment.appointmentUsers.forEach((user) => {
      if (
        user.status === UserAppointmentStatus.PENDING &&
        user.userId != organizer.id
      ) {
        notifyUsers.push(user.userId);
      }
      if (
        user.userId === appointment.doctorId &&
        user.status === UserAppointmentStatus.ACCEPTED &&
        appointment.status === AppointmentStatus.CONFIRMED &&
        user.userId != organizer.id
      ) {
        doctorInvite.push(user.userId);
      }
    });
    this.notificationService.generateNotification(
      {
        ...appointmentMessage,
        actorId: organizer.id,
        payload: {
          appointemntId: appointment.id,
        },
      },
      notifyUsers,
      NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
    );
    if (doctorInvite.length > 0) {
      const messageToDoctor = await this.notificationService.createNotificationMessage(
        {
          ...NOTIFICATION_EVENTS.SCHEDULED_APPOINTMENT_FOR_DOCTOR,
          notificationType: NotificationType.PUSH,
        },
        {
          APPOINTMENT_NAME: appointment.title,
          ORGANIZER_NAME: organizer.firstName,
          PATIENT_NAME: appointment.patient.firstName,
          START_TIME: appointment.startTime,
        },
      );
      this.notificationService.generateNotification(
        {
          ...messageToDoctor,
          actorId: organizer.id,
          payload: {
            appointemntId: appointment.id,
          },
        },
        notifyUsers,
        NOTIFICATION_EVENTS.SCHEDULED_APPOINTMENT_FOR_DOCTOR,
      );
    }
  }

  async sendAppointmentStatusUpdateToAllParties(
    appointmentId: string,
    status: AppointmentStatus,
    actor?: User,
  ) {
    const appointment = await this.appointmentModelService.findOne(
      appointmentId,
    );
    if (appointment.status === status) {
      let message;
      let event;
      switch (status) {
        case AppointmentStatus.CONFIRMED:
          event = NOTIFICATION_EVENTS.APPOINTMENT_CONFIRMATION_TO_ALL;
          message = await this.notificationService.createNotificationMessage(
            {
              ...event,
              notificationType: NotificationType.PUSH,
            },
            {
              APPOINTMENT_NAME: appointment.title,
              TIME: appointment.startTime,
            },
          );
          break;
        case AppointmentStatus.CANCELLED:
          event = NOTIFICATION_EVENTS.APPOINTMENT_CANCELLATION_TO_ALL;
          message = await this.notificationService.createNotificationMessage(
            {
              ...event,
              notificationType: NotificationType.PUSH,
            },
            {
              APPOINTMENT_NAME: appointment.title,
              TIME: appointment.startTime,
            },
          );
          break;
        case AppointmentStatus.REJECTED:
          event = NOTIFICATION_EVENTS.APPOINTMENT_REJECTION;
          message = await this.notificationService.createNotificationMessage(
            {
              ...event,
              notificationType: NotificationType.PUSH,
            },
            {
              APPOINTMENT_NAME: appointment.title,
              USER: actor ? actor.firstName : appointment.doctor.firstName,
            },
          );
          break;
        default:
          throw new Error(
            `Unable to send appointment ${status} to all parties`,
          );
      }
      const notifyUsers = appointment.appointmentUsers.map((user) => {
        return user.userId;
      });
      this.notificationService.generateNotification(
        {
          ...message,
          actorId: actor ? actor.id : appointment.doctorId,
          payload: {
            appointemntId: appointment.id,
          },
        },
        notifyUsers,
        event,
      );
    }
  }

  async validateAndGetAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModelService.findOne(
        appointmentId,
      );
      if (!appointment) {
        throw new HttpException('Invalid appointment', HttpStatus.BAD_REQUEST);
      }
      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async addUserAndSendAppointmentInvite(
    appointment: Appointment,
    userIds: string[],
    reqUser: User,
  ): Promise<AppointmentUsers[]> {
    try {
      const appointmentUserData = userIds.map((id) => {
        return {
          userId: id,
          appointmentId: appointment.id,
          status: UserAppointmentStatus.PENDING,
        };
      });
      const appointmentUsers = await this.appointmentModelService
        .createAppointmentUsers(appointmentUserData)
        .catch((err) => {
          this.logService.logError(
            'Error adding appointment users and send notification',
            err,
          );
          throw new HttpException(
            'Failed to add user for appointment',
            HttpStatus.BAD_REQUEST,
          );
        });
      //send appointment invite notification
      const appointmentMessage = await this.notificationService.createNotificationMessage(
        {
          ...NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
          notificationType: NotificationType.PUSH,
        },
        { NAME: reqUser.firstName },
      );
      this.notificationService.generateNotification(
        {
          ...appointmentMessage,
          actorId: reqUser.id,
          payload: {
            appointemntId: appointment.id,
          },
        },
        userIds,
        NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
      );
      return appointmentUsers;
    } catch (error) {
      throw error;
    }
  }

  async updateReminderForAppointmentUpdate(appointmentId: string) {
    try {
      const appointment = await this.appointmentModelService.findOne(
        appointmentId,
      );
      if (new Date(appointment.startTime) > new Date()) {
        if (appointment.status === AppointmentStatus.CONFIRMED) {
          if (appointment.reminderId) {
            this.updateAppointmentReminder(appointment.id, appointment);
          } else {
            this.addAppointmentReminder(appointment.id, appointment);
          }
        } else if (
          (appointment.status === AppointmentStatus.CANCELLED ||
            appointment.status === AppointmentStatus.REJECTED) &&
          appointment.reminderId
        ) {
          this.deleteAppointmentReminder(appointment.id, appointment);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async addAppointmentReminder(
    appointmentId: string,
    appointment?: Appointment,
  ) {
    try {
      if (!appointment) {
        appointment = await this.appointmentModelService.findOne(appointmentId);
      }
      const remindAt = new Date(
        appointment.startTime.getTime() - NOTIFICATION_REMINDER_BEFORE * 60000,
      );
      const reminderId = await this.eventSchedulerService.createScheduledReminder(
        {
          type: SCHEDULED_REMINDER.APPOINTEMNT_REMINDER,
          remindAt,
          payload: {
            id: appointment.id,
          },
        },
      );
      await this.appointmentModelService.updateAppointmentReminderId(
        appointment.id,
        reminderId,
      );
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentReminder(
    appointmentId: string,
    appointment?: Appointment,
  ) {
    try {
      if (!appointment) {
        appointment = await this.appointmentModelService.findOne(appointmentId);
      }
      const remindAt = new Date(
        appointment.startTime.getTime() - NOTIFICATION_REMINDER_BEFORE * 60000,
      );
      await this.eventSchedulerService.updateScheduledReminder({
        reminderId: appointment.reminderId,
        type: SCHEDULED_REMINDER.APPOINTEMNT_REMINDER,
        remindAt,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAppointmentReminder(
    appointmentId: string,
    appointment?: Appointment,
  ) {
    try {
      if (!appointment) {
        appointment = await this.appointmentModelService.findOne(appointmentId);
      }
      if (appointment && appointment.reminderId) {
        await this.eventSchedulerService.deleteScheduledReminder({
          reminderId: appointment.reminderId,
          type: SCHEDULED_REMINDER.APPOINTEMNT_REMINDER,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  validateAppointmentDTOTime(
    dto: { startTime?: Date; endTime?: Date },
    appointment?: Appointment,
  ) {
    try {
      let success = false;
      let start = null,
        end = null;
      if (dto.startTime && dto.endTime) {
        start = new Date(dto.startTime);
        end = new Date(dto.endTime);
      } else if (dto.startTime && appointment) {
        start = new Date(dto.startTime);
        end = appointment.endTime;
      } else if (dto.endTime && appointment) {
        start = appointment.startTime;
        end = new Date(dto.endTime);
      } else {
        end = new Date(appointment.endTime);
      }
      if (start && end) {
        success =
          start < end &&
          end.getTime() - start.getTime() >= MINIMUM_APPOINTMENT_TIME;
      } else {
        success = true;
      }
      if (!success) {
        throw new HttpException(
          `Appointment start time should always shorter than end time and minimum time should be ${
            MINIMUM_APPOINTMENT_TIME / 60000
          } Minutes`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (end < new Date()) {
        throw new HttpException(
          `The appointment time has already been passed. Please update the time`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return success;
    } catch (error) {
      throw error;
    }
  }

  getAppointmentStartTime(appointment: Appointment | UserAppointments): Date {
    const appointmentStarttime = new Date(appointment.startTime);
    return new Date(
      appointmentStarttime.getTime() - APPOINTMENT_START_BEFORE_MINUTES * 60000,
    );
  }

  async getSecretAndSaltForAppointment(
    appointmentId: string,
  ): Promise<{ secret: string; salt: string }> {
    try {
      const appointmentSecret = await this.appointmentModelService.getAppointmentSecretAndSalt(
        appointmentId,
      );
      if (appointmentSecret) {
        if (!appointmentSecret.secret || !appointmentSecret.salt) {
          const secret = cryptoRandomString({ length: 64 });
          const salt = cryptoRandomString({ length: 43, type: 'base64' });
          await this.appointmentModelService.updateAppointmentSecretAndSalt(
            appointmentId,
            secret,
            salt,
          );
          return { secret, salt };
        } else {
          return {
            secret: appointmentSecret.secret,
            salt: appointmentSecret.salt,
          };
        }
      } else {
        throw new Error('Invalid appointment');
      }
    } catch (error) {
      throw error;
    }
  }

  async findUserMonthlyCalendarAppointments(
    user: User,
    filter: getMonthlyCalendarAppointmentsDto,
  ) {
    try {
      // FIX NEEDED: Limit the number of userAppointments in calendar Object
      const userCalendarAppointments = await this.calendarModelService.findUserCalendarAppointmentsBetweenDates(
        {
          userId: user.id,
          ...filter,
        },
      );
      const userAppointmentsObject = {};
      const calendarAppointments = {};
      userCalendarAppointments.forEach((calendar) => {
        userAppointmentsObject[
          `${calendar.year}-${calendar.month}-${calendar.day}`
        ] = calendar.userAppointments ? calendar.userAppointments : [];
      });
      for (
        let startDate = new Date(filter.startDate);
        startDate <= filter.endDate;
        startDate.setDate(startDate.getDate() + 1)
      ) {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();
        calendarAppointments[
          `${year}-${month}-${day}`
        ] = userAppointmentsObject[`${year}-${month}-${day}`]
          ? userAppointmentsObject[`${year}-${month}-${day}`]
          : [];
      }
      return calendarAppointments;
    } catch (error) {
      throw error;
    }
  }
}
