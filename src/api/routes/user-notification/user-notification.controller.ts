import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Patch,
  Param,
  Post,
  BadRequestException,
  Body,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserNotificationService } from './user-notification.service';
import { getPagination } from 'src/common/utils/entity_metadata';
import { NotificationModelService } from '../../../models/notification/notification.model.service';
import {
  deleteUserNotificationDto,
  getUserNotificationDtoPaginated,
  SendCustomNotificationDto,
} from './dto';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { NotificationService } from '../../../services/notification/notification.service';
import {
  CUSTOM_ALERT_TYPE,
  NOTIFICATION_EVENTS,
} from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/models/user/entity/user.enum';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserModelService } from '../../../models/user/user.model.service';
import { UserResourceGuard } from 'src/common/guards/user_resource.guard';
import { OrganizationUserResourceGuard } from 'src/common/guards/organization_user_resource.guard';

@Controller('user-notification')
@ApiBearerAuth()
@ApiTags('User-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
    private readonly notificationModelService: NotificationModelService,
    private readonly notificationService: NotificationService,
    private readonly userModelService: UserModelService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllUserNotificationsPaginated(
    @Request() req,
    @Query() params: getUserNotificationDtoPaginated,
  ) {
    const {
      actorId,
      event,
      eventCategory,
      isRead,
      isAcknowledged,
      ...paginateParams
    } = params;
    const { limit, skip } = getPagination(paginateParams);
    return await this.notificationModelService.findUserNotificationsPaginated({
      skip,
      limit,
      userId: req.user.id,
      actorId,
      isRead,
      isAcknowledged,
      event: Array.isArray(event) ? event : event ? [event] : [],
      eventCategory: Array.isArray(eventCategory)
        ? eventCategory
        : eventCategory
        ? [eventCategory]
        : [],
    });
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/patient/:patientId')
  @ApiParam({ name: 'patientId', type: String, required: true })
  async getPatientNotificationsPaginated(
    @Request() req,
    @Query() params: getUserNotificationDtoPaginated,
    @Param('patientId') patientId: string,
  ) {
    const {
      actorId,
      event,
      eventCategory,
      isRead,
      isAcknowledged,
      ...paginateParams
    } = params;
    const { limit, skip } = getPagination(paginateParams);
    return await this.notificationModelService.findUserNotificationsPaginated({
      skip,
      limit,
      userId: patientId,
      actorId,
      isRead,
      isAcknowledged,
      event: Array.isArray(event) ? event : event ? [event] : [],
      eventCategory: Array.isArray(eventCategory)
        ? eventCategory
        : eventCategory
        ? [eventCategory]
        : [],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/custom-notification')
  async getCustomNotificationMessages() {
    return await this.userNotificationService.getCustomNotificationEvents();
  }

  @ApiBody({
    type: SendCustomNotificationDto,
    description: 'Send medical or non medical alert notification to patient',
  })
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/custom-notification')
  async sendCustomNotificationMessages(
    @Request() req,
    @Body() sendNotificationDto: SendCustomNotificationDto,
  ) {
    try {
      const { alertType, patientId, messageText } = sendNotificationDto;
      await this.userModelService.validateUserIds([patientId]).catch(() => {
        throw new BadRequestException('Invalid patient Id');
      });
      const notificationEvent =
        alertType === CUSTOM_ALERT_TYPE.MEDICAL_ALERT
          ? NOTIFICATION_EVENTS.CUSTOM_MEDICAL_ALERT_PATIENT
          : NOTIFICATION_EVENTS.CUSTOM_NON_MEDICAL_ALERT_PATIENT;
      const notificationMessage = await this.notificationService.createNotificationMessage(
        {
          ...notificationEvent,
          notificationType: NotificationType.PUSH,
        },
        {},
      );
      if (messageText) {
        notificationMessage.messageContent = messageText;
      }
      //send notification to patient
      this.notificationService.generateNotification(
        {
          ...notificationMessage,
          actorId: req.user.id,
          payload: { alertType },
        },
        [patientId],
        notificationEvent,
      );
      return {
        status: 200,
        message: 'Notification send Successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/read/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateNotificationReadStatus(@Request() req, @Param('id') id: string) {
    const notifier = await this.userNotificationService.validateAndGetUserNotifierObject(
      id,
      req.user.id,
    );
    let update = false;
    if (!notifier.isRead) {
      await this.userNotificationService.updateNotifierReadStatus(notifier);
      update = true;
    }
    return {
      status: 200,
      update,
      message: 'SUCCESS',
    };
  }

  @UseGuards(JwtAuthGuard, UserResourceGuard, OrganizationUserResourceGuard)
  @Delete('/:type')
  @ApiParam({
    name: 'type',
    type: String,
    required: true,
    enum: ['all', 'selective'],
  })
  async deleteNotification(
    @Param('type') type: string,
    @Query() params: deleteUserNotificationDto,
  ) {
    try {
      switch (type) {
        case 'all':
          await this.userNotificationService.dismissAllUserNotifications(
            params.userId,
          );
          break;
        case 'selective':
          const notificationsId = Array.isArray(params.notificationsId)
            ? params.notificationsId
            : params.notificationsId
            ? [params.notificationsId]
            : [];
          if (notificationsId.length > 0) {
            await this.userNotificationService
              .validateDeleteUserNotifications(params.userId, notificationsId)
              .catch((err) => {
                throw new BadRequestException(err.message);
              });
            await this.notificationModelService.softDeleteNotificationsById(
              notificationsId,
            );
          } else {
            throw new BadRequestException(
              'Please specify notifications to delete',
            );
          }
          break;
        default:
          throw new BadRequestException('Invalid type in request');
      }
      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/acknowledge/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async updateNotificationAcknowledgeStatus(
    @Request() req,
    @Param('id') id: string,
  ) {
    const userNotification = await this.notificationModelService.getOneUserNotification(
      id,
      req.user.id,
    );
    if (!userNotification) {
      throw new BadRequestException('Invalid notification for user');
    }
    if (!userNotification.acknowledgeRequired) {
      throw new BadRequestException(
        'This notification does not require acknowledgement',
      );
    }
    return {
      status: 200,
      update: await this.userNotificationService.updateUserNotificationAcknowledgement(
        userNotification,
      ),
      message: 'SUCCESS',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async updateAllNotificationReadStatus(@Request() req) {
    return {
      status: 200,
      updateCount: await this.notificationModelService.updateAllNotificationReadStatusOfUser(
        req.user.id,
      ),
      message: 'SUCCESS',
    };
  }
}
