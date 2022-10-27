import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { NotificationReminderService } from './notification-reminder.service';
import {
  CreateNotificationReminderDto,
  NotificationRemindersListPaginated,
  UpdateNotificationReminderDto,
  UpdateReminderActiveStatusDto,
} from './dto';
import { JoiValidationPipe } from 'src/common/validators/joi.validator';
import { CreateNotificationReminderSchema } from './schemas';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/models/user/entity/user.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { EventSchedulerService } from '../../../services/event-scheduler/event-scheduler.service';
import { NotificationReminderModelService } from '../../../models/notification_reminder/notification_reminder.model.service';
import { getPagination } from 'src/common/utils/entity_metadata';
import { LogService } from 'src/services/logger/logger.service';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';

@Controller('notification-reminder')
@ApiBearerAuth()
@ApiTags('Notification-Reminder')
export class NotificationReminderController {
  constructor(
    private readonly notificationReminderService: NotificationReminderService,
    private readonly notificationReminderModelService: NotificationReminderModelService,
    private readonly eventSchedulerService: EventSchedulerService,
    private logService: LogService,
  ) {}

  @Roles(Role.PATIENT)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    OrganizationPatientResourceGuard,
    PatientResourceGuard,
  )
  @Post()
  @UsePipes(new JoiValidationPipe(CreateNotificationReminderSchema))
  @ApiBody({
    type: CreateNotificationReminderDto,
    description: 'Create reminders for patient',
  })
  async create(@Body() body: CreateNotificationReminderDto) {
    try {
      await this.notificationReminderService.validatePatientPrescription(body);
      return await this.notificationReminderService
        .createPatientCustomReminder(body)
        .catch((err) => {
          if (err.message.includes('duplicate key')) {
            throw new BadRequestException(
              'Reminder already exist for the prescription',
            );
          }
          throw err;
        });
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(
    JwtAuthGuard,
    OrganizationPatientResourceGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get()
  async getAllNotificationReminders(
    @Query() queryParams: NotificationRemindersListPaginated,
  ) {
    const { perPage, page, patientId, ...filterParams } = queryParams;
    const { limit, skip } = getPagination({ perPage, page });
    return await this.notificationReminderModelService.findAllPatientRemindersPaginatedAndFilter(
      patientId,
      {
        skip,
        limit,
        ...filterParams,
      },
    );
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get(':id')
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async findOneDetails(
    @Param('id') id: string,
    @Query('patientId') patientId: string,
  ) {
    try {
      const reminderDetails = await this.notificationReminderModelService.findOneDetailsById(
        id,
      );
      if (
        reminderDetails.patientId &&
        reminderDetails.patientId !== patientId
      ) {
        throw new BadRequestException(
          'Invalid notification reminder for patient',
        );
      }
      return reminderDetails;
    } catch (error) {
      this.logService.logError('error finding notification reminder', error);
      throw error;
    }
  }

  @Roles(Role.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Delete(':id')
  @ApiQuery({ name: 'patientId', type: String, required: true })
  async deleteNotificationReminder(
    @Request() req,
    @Param('id') id: string,
    @Query('patientId') patientId: string,
  ) {
    const reminder = await this.notificationReminderService.validateAndGetReminder(
      id,
    );
    if (reminder.patientId !== patientId) {
      throw new BadRequestException('Invalid reminder for patient');
    }
    if (reminder.isDefault) {
      throw new BadRequestException('You cannot delete a default reminder');
    }
    return await this.notificationReminderService.deleteNotificationReminder(
      reminder,
    );
  }

  @Roles(Role.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateNotificationReminderDto,
  ) {
    try {
      const patientId = updateData.patientId;
      const reminder = await this.notificationReminderService.validateAndGetReminder(
        id,
      );
      if (updateData.reminderTimes.length === 0) {
        throw new BadRequestException('Reminder times cannot be empty');
      }
      if (reminder.patientId && reminder.patientId !== patientId) {
        throw new BadRequestException('Invalid reminder for patient');
      }
      const defaultReminderTimes = await this.notificationReminderModelService.getDefaultReminderTimesByType(
        reminder.type,
      );
      if (reminder.isDefault && !reminder.patientId) {
        if (
          await this.notificationReminderModelService.isPatientDefaultExist(
            patientId,
            reminder.type,
          )
        ) {
          throw new BadRequestException('Invalid patient reminder');
        }
        const {
          updateRequired,
          createReminderTime,
        } = this.notificationReminderService.validateAndGetUpdateReminderTimes(
          defaultReminderTimes,
          updateData.reminderTimes,
          defaultReminderTimes,
        );
        if (updateRequired) {
          const newReminder = await this.notificationReminderService.createPatientDefaultReminder(
            {
              patientId,
              type: reminder.type,
              reminderTimes: createReminderTime,
              isActive: reminder.isActive,
            },
          );
          return newReminder;
        } // else No need to update reminder. Since previous times = new requested times
      } else {
        const {
          updateRequired,
          createReminderTime,
        } = this.notificationReminderService.validateAndGetUpdateReminderTimes(
          reminder.reminderTimes,
          updateData.reminderTimes,
          reminder.isDefault ? defaultReminderTimes : [],
        );
        if (updateRequired) {
          const updatedDefaultReminder = await this.notificationReminderService.updateNotifcationReminderTimes(
            reminder,
            createReminderTime,
          );
          return updatedDefaultReminder;
        } // else No need to update reminder. Since previous times = new requested times
      }
      return reminder;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Patch('/status/:id')
  async updateActiveStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReminderActiveStatusDto,
  ) {
    try {
      const patientId = updateStatusDto.patientId;
      const reminder = await this.notificationReminderService.validateAndGetReminder(
        id,
      );
      if (reminder.patientId && reminder.patientId !== patientId) {
        throw new BadRequestException('Invalid reminder for patient');
      }
      if (reminder.isDefault && !reminder.patientId) {
        if (
          await this.notificationReminderModelService.isPatientDefaultExist(
            patientId,
            reminder.type,
          )
        ) {
          throw new BadRequestException('Invalid patient reminder');
        }
        if (reminder.isActive === updateStatusDto.isActive) {
          return reminder;
        }
        const newReminder = await this.notificationReminderService.createPatientDefaultReminder(
          {
            patientId,
            type: reminder.type,
            reminderTimes: reminder.reminderTimes,
            isActive: updateStatusDto.isActive,
          },
        );
        return newReminder;
      } else {
        if (reminder.isActive === updateStatusDto.isActive) {
          return reminder;
        }
        await this.notificationReminderModelService.updateReminderStatus(
          reminder.id,
          updateStatusDto.isActive,
        );
        return { ...reminder, isActive: updateStatusDto.isActive };
      }
    } catch (error) {
      throw error;
    }
  }
}
