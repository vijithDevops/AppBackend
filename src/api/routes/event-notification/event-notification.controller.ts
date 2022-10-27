import { LogService } from './../../../services/logger/logger.service';
import { NotificationReminderService } from './../notification-reminder/notification-reminder.service';
import { OrganizationModelService } from './../../../models/organization/organization.model.service';
import {
  Body,
  Controller,
  Logger,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EventNotificationService } from './event-notification.service';
import { ServerToServerAuthGuard } from '../../../common/guards/server_to_server_auth.guard';
import { IntervalJobSchedulerEventDto, ReminderNotificationDto } from './dto';
import {
  DAILY_REMINDER,
  SCHEDULER_JOBS,
  SCHEDULED_REMINDER,
  INTERVAL_JOBS,
} from '../../../services/event-scheduler/event-scheduler.enum';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { MedicalAlertsService } from '../medical-alerts/medical-alerts.service';

@ApiTags('Event-Notification')
@Controller('event-notification')
export class EventNotificationController {
  constructor(
    private readonly eventNotificationService: EventNotificationService,
    private readonly medicalAlertsService: MedicalAlertsService,
    private readonly organizationModelService: OrganizationModelService,
    private readonly notificationReminderService: NotificationReminderService,
    private readonly logService: LogService,
  ) {}

  @ApiHeader({
    name: 'authorization',
    description: 'Server to Server authorization token header',
  })
  @UseGuards(ServerToServerAuthGuard)
  @Post('/reminder')
  async reminderNotification(@Body() body: ReminderNotificationDto) {
    try {
      switch (body.reminderName) {
        case SCHEDULER_JOBS.SCHEDULED_REMINDER:
          switch (body.reminderType) {
            case SCHEDULED_REMINDER.APPOINTEMNT_REMINDER:
              await this.eventNotificationService.sendAppointmentReminderNotification(
                body.reminderId,
              );
          }
          break;
        case SCHEDULER_JOBS.DAILY_REMINDER:
          switch (body.reminderType) {
            case DAILY_REMINDER.MEDICATION_REMINDER:
            case DAILY_REMINDER.BREATHING_EXERCISE_REMINDER:
            case DAILY_REMINDER.HEALTH_INPUT_REMINDER:
            case DAILY_REMINDER.SENSOR_USE_REMINDER:
              await this.eventNotificationService.sendReminderNotification(
                body.reminderId,
              );
              break;
          }
        case SCHEDULER_JOBS.DAILY_DEFAULT_REMINDER:
          if (!body.organizationId) {
            throw new BadRequestException('Organization Id is required');
          }
          const organization = await this.organizationModelService.findOne(
            body.organizationId,
          );
          const reminderTime = {
            hour: body.data.hour,
            minute: body.data.minute,
            isDefault: true,
          };
          const reminderTypes = body.data.types;
          this.logService.logInfo(
            `Cron running to send default reminder for ${reminderTypes} at ${reminderTime}`,
          );
          this.notificationReminderService.sendDefaultReminderNotification(
            reminderTime,
            reminderTypes,
            organization.id,
          );
      }
    } catch (error) {
      Logger.error(
        `error sending Reminder notification for: ${body.reminderType}`,
        error,
      );
      throw new HttpException(
        'Failed to send notification',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: 200,
    };
  }

  @ApiHeader({
    name: 'authorization',
    description: 'Server to Server authorization token header',
  })
  @UseGuards(ServerToServerAuthGuard)
  @Post('/interval-job')
  async intervalJobSchedulerEvent(@Body() body: IntervalJobSchedulerEventDto) {
    try {
      switch (body.jobName) {
        case SCHEDULER_JOBS.INTERVAL_JOBS:
          switch (body.jobType) {
            case INTERVAL_JOBS.MEDICAL_ALERTS:
              this.medicalAlertsService.triggerMedicalAlertJobBySchedulerId(
                body.jobId,
              );
              break;
            case INTERVAL_JOBS.DP_CACHE_UPDATE:
              this.eventNotificationService.triggerCacheUpdateOnDataServer(
                body.jobId,
              );
              break;
          }
          break;
      }
    } catch (error) {
      Logger.error(`error triggering Interval job for: ${body.jobType}`, error);
      throw new HttpException(
        'Failed to send notification',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: 200,
    };
  }
}
