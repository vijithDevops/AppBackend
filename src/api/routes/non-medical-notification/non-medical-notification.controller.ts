import { PatientInfoModelService } from 'src/models/patient_info/patient_info.model.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  Query,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { NonMedicalNotificationService } from './non-medical-notification.service';
import {
  CreateNonMedicalNotificationDto,
  getNonMedicalNotificationDtoPaginated,
  sendNonMedicalNotificationDto,
} from './dto';
import { UpdateNonMedicalNotificationDto } from './dto/update-non-medical-notification.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/models/user/entity/user.enum';
import { ApiBearerAuth, ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { NonMedicalNotificationModelService } from '../../../models/non_medical_notification/non_medical_notification.model.service';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { getPagination } from 'src/common/utils/entity_metadata';
import { LogService } from '../../../services/logger/logger.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { PatientSupervisionMappingModelService } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from 'src/config/master-data-constants';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { ServiceAuthGuard } from 'src/common/guards/service_auth.guard';

@Controller('non-medical-notification')
@ApiBearerAuth()
@ApiTags('Non-Medical-Notification')
export class NonMedicalNotificationController {
  constructor(
    private readonly nonMedicalNotificationService: NonMedicalNotificationService,
    private readonly nonMedicalNotificationModelService: NonMedicalNotificationModelService,
    private readonly userModelService: UserModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
    private readonly notificationService: NotificationService,
    private readonly logService: LogService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createNonMedicalNotificationDto: CreateNonMedicalNotificationDto,
  ) {
    try {
      return await this.nonMedicalNotificationModelService
        .create(createNonMedicalNotificationDto)
        .catch((err) => {
          this.logService.logError(
            'Error creating non medical notification',
            err,
          );
          if (err.message && err.message.includes('duplicate key')) {
            throw new BadRequestException(
              'Field Id should be unique for Organization',
            );
          } else {
            throw err;
          }
        });
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get()
  async findAllPaginated(
    @Request() req,
    @Query() queryParams: getNonMedicalNotificationDtoPaginated,
  ) {
    const { page, perPage, ...filterOptions } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    return await this.nonMedicalNotificationModelService.findAllPaginated({
      ...filterOptions,
      limit,
      skip,
    });
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNonMedicalNotificationDto: UpdateNonMedicalNotificationDto,
  ) {
    try {
      const notification = await this.nonMedicalNotificationModelService.findOneById(
        id,
      );
      if (
        req.user.role !== Role.ADMIN &&
        req.user.organizationId !== notification.organizationId
      ) {
        throw new ForbiddenException();
      }
      if (
        updateNonMedicalNotificationDto.organizationId &&
        notification.organizationId !==
          updateNonMedicalNotificationDto.organizationId
      ) {
        throw new BadRequestException('Updating organization is resticted');
      }
      await this.nonMedicalNotificationModelService
        .update(id, updateNonMedicalNotificationDto)
        .catch(() => {
          throw new BadRequestException('Field Id should be unique');
        });
      return await this.nonMedicalNotificationModelService.findOneById(id);
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  async delete(@Param('id') id: string) {
    try {
      await this.nonMedicalNotificationModelService.delete(id);
      return {
        message: 'Notification deleted Successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(ServiceAuthGuard)
  @ApiHeader({
    name: 'auth-token',
    description: 'Use the secret auth token to authorize the request',
    required: true,
  })
  @Post('/send-notification')
  async sendNotification(@Body() dto: sendNonMedicalNotificationDto) {
    try {
      const notificationSetings = await this.nonMedicalNotificationModelService.findOneByFieldId(
        dto.fieldId,
      );
      if (!notificationSetings) {
        throw new BadRequestException('Invalid notification field specified');
      }
      const patientUserIds = await this.patientInfoModelService
        .validatePatientIntIdsAndGetUserIds(
          dto.patientIntegerIds,
          notificationSetings.organizationId,
          false,
        )
        .catch(() => {
          throw new BadRequestException('Invalid patientId in the request');
        });
      const {
        notifyUsersWithAck,
        notifyUsersWithoutAck,
      } = await this.nonMedicalNotificationService.getNotifyUsersForNonMedicalNotification(
        patientUserIds,
        notificationSetings,
      );
      const notificationMessage = await this.notificationService.createNotificationMessage(
        {
          ...NOTIFICATION_EVENTS.NON_MEDICAL_NOTIFICATION_EVENT,
          notificationType: NotificationType.PUSH,
        },
        {},
        notificationSetings.message,
      );
      const adminId = await this.userModelService.getAdminUserId();
      // send notification to users with ACK
      if (notifyUsersWithAck && notifyUsersWithAck.length > 0) {
        this.notificationService.generateNotification(
          {
            ...notificationMessage,
            actorId: adminId,
            acknowledgeRequired: true,
            payload: {},
          },
          notifyUsersWithAck,
          NOTIFICATION_EVENTS.NON_MEDICAL_NOTIFICATION_EVENT,
        );
      }
      // send notification to users without ACK
      if (notifyUsersWithoutAck && notifyUsersWithoutAck.length > 0) {
        this.notificationService.generateNotification(
          {
            ...notificationMessage,
            actorId: adminId,
            acknowledgeRequired: false,
            payload: {},
          },
          notifyUsersWithoutAck,
          NOTIFICATION_EVENTS.NON_MEDICAL_NOTIFICATION_EVENT,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
