import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Query,
  Param,
  Patch,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { RolesGuard } from '../../../common/guards/role.guard';
import {
  AppointmentStatus,
  UserAppointmentStatus,
  AppointmentType,
} from '../../../models/appointment/entity/appointment.enum';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { getPagination } from 'src/common/utils/entity_metadata';
import {
  AGORA_PRESENTATION_MASK_USER_ID,
  AGORA_CHAT_MASK_USER_ID,
} from '../../../config/constants';
import { VideoCallService } from '../../../services/video-call/video-call.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from '../../../config/master-data-constants';
import {
  AddAppointmentUserDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  getAddUsersListAppointmentPaginated,
  getAppointmentsDtoPaginated,
  getMonthlyCalendarAppointmentsDto,
  MonthlyCalendarAppointmentsResponseDto,
} from './dto';
import { AppointmentModelService } from '../../../models/appointment/appointment.model.service';
import { CalendarModelService } from '../../../models/calendar/calendar.model.service';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { LogService } from '../../../services/logger/logger.service';
import {
  getStartOfDayDate,
  getEndOfDayDate,
} from 'src/common/utils/date_helper';
import { EmailService } from '../../../services/email/email.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { OrganizationAppointmentResourceGuard } from 'src/common/guards/organization_appointment_resource.guard';

@Controller('appointment')
@ApiBearerAuth()
@ApiTags('Appointment')
export class AppointmentController {
  constructor(
    private configService: ConfigService,
    private appointmentService: AppointmentService,
    private appointmentModelService: AppointmentModelService,
    private calendarModelService: CalendarModelService,
    private userModelService: UserModelService,
    private logService: LogService,
    private readonly videoCallService: VideoCallService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(JwtAuthGuard, PatientResourceGuard, OrganizationFilterGuard)
  @Post('/')
  async create(
    @Request() req,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    try {
      // await this.userModelService
      //   .validateOrganizationOfUsers(
      //     [
      //       createAppointmentDto.patientId,
      //       createAppointmentDto.doctorId,
      //       ...createAppointmentDto.addUsers,
      //     ],
      //     createAppointmentDto.organizationId
      //       ? createAppointmentDto.organizationId
      //       : req.user.organizationId,
      //   )
      //   .catch((err) => {
      //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      //   });
      if (!createAppointmentDto.organizationId) {
        createAppointmentDto.organizationId = req.user.organizationId;
      }
      await this.appointmentService.validateCreateAppointmentUsers(
        createAppointmentDto,
      );
      this.appointmentService.validateAppointmentDTOTime(createAppointmentDto);
      if (
        await this.appointmentModelService.isAnyUpComingAppointmentExist(
          createAppointmentDto,
        )
      ) {
        throw new HttpException(
          'The appointment cannot be booked for the specified time. A Confirmed appointment already exists for the Patient or Doctor',
          HttpStatus.CONFLICT,
        );
      }
      const organizerRole = req.user.role;
      const organizerId = req.user.id;
      const appointment = await this.appointmentModelService
        .create({
          ...createAppointmentDto,
          calendarId: (
            await this.calendarModelService.getCalendarDate(
              new Date(createAppointmentDto.startTime),
            )
          ).id,
          status:
            // (!createAppointmentDto.isAckRequired &&
            //   ((organizerRole === Role.DOCTOR &&
            //     req.user.id === createAppointmentDto.doctorId) ||
            //     organizerRole === Role.NURSE)) ||
            createAppointmentDto.autoConfirm && req.user.role !== Role.PATIENT
              ? AppointmentStatus.CONFIRMED
              : AppointmentStatus.PENDING,
        })
        .catch((err) => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      const appointmentUsers = [
        {
          appointmentId: appointment.id,
          userId: createAppointmentDto.patientId,
          isOrganizer:
            organizerId === createAppointmentDto.patientId ? true : false,
          status:
            organizerRole === Role.PATIENT || organizerRole === Role.CARETAKER
              ? UserAppointmentStatus.ACCEPTED
              : UserAppointmentStatus.PENDING,
        },
        {
          appointmentId: appointment.id,
          userId: createAppointmentDto.doctorId,
          isOrganizer:
            organizerId === createAppointmentDto.doctorId ? true : false,
          status:
            (organizerRole === Role.DOCTOR &&
              req.user.id === createAppointmentDto.doctorId) ||
            organizerRole === Role.NURSE
              ? UserAppointmentStatus.ACCEPTED
              : UserAppointmentStatus.PENDING,
        },
      ];
      if (
        organizerId !== createAppointmentDto.patientId &&
        organizerId !== createAppointmentDto.doctorId
      ) {
        appointmentUsers.push({
          appointmentId: appointment.id,
          userId: organizerId,
          status:
            organizerRole === Role.CARETAKER
              ? UserAppointmentStatus.ACCEPTED
              : UserAppointmentStatus.PENDING,
          isOrganizer: true,
        });
      }
      //add other invites
      if (
        createAppointmentDto.addUsers &&
        createAppointmentDto.addUsers.length > 0
      ) {
        createAppointmentDto.addUsers.forEach((id) => {
          if (
            id != createAppointmentDto.patientId &&
            id != createAppointmentDto.doctorId &&
            id != organizerId
          ) {
            appointmentUsers.push({
              userId: id,
              appointmentId: appointment.id,
              status: UserAppointmentStatus.PENDING,
              isOrganizer: false,
            });
          }
        });
      }
      appointment.appointmentUsers = await this.appointmentModelService
        .createAppointmentUsers(appointmentUsers)
        .catch((err) => {
          this.appointmentModelService.remove(appointment.id);
          this.logService.logError('Error creating appointment users', err);
          throw new HttpException(
            'Failed to create appointment',
            HttpStatus.BAD_REQUEST,
          );
        });
      //send appointment invite notification
      this.appointmentService.sendAppointmentInvite(appointment.id, req.user);
      // TODO: send notification to appointment doctor if nurse creates the appointment without acknowledgement required.(Done on previous step Testing required)
      if (appointment.status === AppointmentStatus.CONFIRMED) {
        //add appointemnt reminder
        this.appointmentService.addAppointmentReminder(appointment.id);
      }
      return appointment;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationAppointmentResourceGuard)
  @Get('/add-user-list')
  async addUsersListForAppointment(
    @Query() queryParams: getAddUsersListAppointmentPaginated,
  ) {
    const { page, perPage, excludeIds, ...filterOptions } = queryParams;
    if (!filterOptions.appointmentId && !filterOptions.patientId) {
      throw new BadRequestException('Appointment Id or patient Id is required');
    }
    const { limit, skip } = getPagination({ page, perPage });
    const filters = {
      patientId: null,
      organizationId: null,
      appointmentId: null,
    };
    if (filterOptions.patientId) {
      const patient = await this.userModelService.findOneUser(
        filterOptions.patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new BadRequestException('Invalid patientId');
      }
      filters.patientId = patient.id;
      filters.organizationId = patient.organizationId;
    }
    if (filterOptions.appointmentId) {
      const appointment = await this.appointmentModelService.findOne(
        filterOptions.appointmentId,
      );
      if (!appointment) {
        throw new BadRequestException('Invalid appointment Id');
      }
      filters.patientId = appointment.patientId;
      filters.organizationId = appointment.organizationId;
      filters.appointmentId = appointment.id;
    }
    return await this.appointmentModelService.getAddAppointmentUsersListPaginated(
      {
        skip,
        limit,
        ...filterOptions,
        ...filters,
        excludeUserIds: Array.isArray(excludeIds)
          ? excludeIds
          : excludeIds
          ? [excludeIds]
          : [],
      },
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get()
  async getAppointments(
    @Request() req,
    @Query() queryParams: getAppointmentsDtoPaginated,
  ) {
    const { page, perPage, status, ...filterOptions } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    if (filterOptions.date) {
      filterOptions['calendarId'] = (
        await this.calendarModelService.getCalendarDate(
          new Date(filterOptions.date),
        )
      ).id;
    }
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.NURSE) {
      filterOptions['userId'] = req.user.id;
    }
    return await this.appointmentModelService.findAllAppointmentsPaginated({
      ...filterOptions,
      status: Array.isArray(status) ? status : status ? [status] : [],
      limit,
      skip,
    });
  }

  @ApiOperation({
    description: 'API to get monthly calendar appointments',
  })
  @ApiOkResponse({
    type: [MonthlyCalendarAppointmentsResponseDto],
  })
  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get('/monthly-calendar')
  async getMonthlyCalendarAppointments(
    @Request() req,
    @Query() queryParams: getMonthlyCalendarAppointmentsDto,
  ) {
    return await this.appointmentService.findUserMonthlyCalendarAppointments(
      req.user,
      {
        ...queryParams,
        startDate: getStartOfDayDate(queryParams.startDate),
        endDate: getEndOfDayDate(queryParams.endDate),
      },
    );
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAppointmentResourceGuard)
  @Post('/add-user')
  async inviteUserForAppointment(
    @Request() req,
    @Body() addAppointmentUser: AddAppointmentUserDto,
  ) {
    try {
      const appointment = await this.appointmentService.validateAndGetAppointment(
        addAppointmentUser.appointmentId,
      );
      // validate request users organization
      await this.userModelService
        .validateOrganizationOfUsers(
          addAppointmentUser.users,
          appointment.organizationId,
        )
        .catch((err) => {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
      return await this.appointmentService.addUserAndSendAppointmentInvite(
        appointment,
        addAppointmentUser.users,
        req.user,
      );
      // const appointmentUserData = addAppointmentUser.users.map((id) => {
      //   return {
      //     userId: id,
      //     appointmentId: addAppointmentUser.appointmentId,
      //     status: UserAppointmentStatus.PENDING,
      //   };
      // });
      // const appointmentUsers = await this.appointmentModelService
      //   .createAppointmentUsers(appointmentUserData)
      //   .catch((err) => {
      //     Logger.error('Error adding appointment users', err);
      //     throw new HttpException(
      //       'Failed to add user for appointment',
      //       HttpStatus.BAD_REQUEST,
      //     );
      //   });
      // //send appointment invite notification
      // const appointmentMessage = await this.notificationService.createNotificationMessage(
      //   {
      //     ...NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
      //     notificationType: NotificationType.PUSH,
      //   },
      //   { NAME: req.user.firstName },
      // );
      // this.notificationService.generateNotification(
      //   {
      //     ...appointmentMessage,
      //     actorId: req.user.id,
      //     payload: {
      //       appointemntId: addAppointmentUser.appointmentId,
      //     },
      //   },
      //   addAppointmentUser.users,
      //   NOTIFICATION_EVENTS.INVITE_NEW_APPOINTMENT,
      // );
      // return appointmentUsers;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationAppointmentResourceGuard)
  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  async findOne(@Param('id') id: string) {
    return await this.appointmentModelService.findOneDetail(id);
  }

  @UseGuards(JwtAuthGuard, OrganizationAppointmentResourceGuard)
  @Patch(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    try {
      const appointment = await this.appointmentService.validateAndGetAppointment(
        id,
      );
      this.appointmentService.validateAppointmentDTOTime(
        updateAppointmentDto,
        appointment,
      );
      // Check for patient/caretaker permission to update appointment
      if (req.user.role === Role.PATIENT || req.user.role === Role.CARETAKER) {
        const patientId =
          req.user.role === Role.PATIENT
            ? req.user.id
            : req.user.caretakersPatient.patientId;
        if (!patientId) {
          throw new ForbiddenException();
        }
        await this.appointmentService.canPatientUpdateAppointment(
          patientId,
          appointment,
          updateAppointmentDto,
        );
      }
      if (updateAppointmentDto.status) {
        if (
          !this.appointmentService.validateUpdateAppointmentStatus(
            updateAppointmentDto.status,
            appointment,
            updateAppointmentDto,
          )
        ) {
          throw new HttpException(
            `Filed to update a ${appointment.status} appointment to ${updateAppointmentDto.status}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      if (
        (updateAppointmentDto.startTime ||
          updateAppointmentDto.endTime ||
          updateAppointmentDto.status === AppointmentStatus.CONFIRMED) &&
        (await this.appointmentModelService.isAnyUpComingAppointmentExist(
          {
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            startTime: updateAppointmentDto.startTime
              ? updateAppointmentDto.startTime
              : appointment.startTime,
            endTime: updateAppointmentDto.endTime
              ? updateAppointmentDto.endTime
              : appointment.endTime,
          },
          appointment.id,
        ))
      ) {
        throw new HttpException(
          'The appointment cannot be updated for the specified time. A confirmed appointment already exists for the Patient or Doctor',
          HttpStatus.CONFLICT,
        );
      }
      const appointmentPreviousStatus = appointment.status;
      await this.appointmentModelService
        .update(id, updateAppointmentDto)
        .catch((err) => {
          this.logService.logError('Error updating appointment', err);
          throw new HttpException(
            'Failed to update appointment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });
      if (
        updateAppointmentDto.status &&
        updateAppointmentDto.status === AppointmentStatus.PENDING &&
        (appointmentPreviousStatus === AppointmentStatus.REJECTED ||
          appointmentPreviousStatus === AppointmentStatus.CANCELLED)
      ) {
        /* If the appointment status changeg from cancelled/ rejected to pending, then new invite has been send to all parties */
        const isDoctorReq = req.user.id === appointment.doctorId ? true : false;
        await this.appointmentModelService.updateAllPartiesStatus(
          appointment.id,
          UserAppointmentStatus.PENDING,
          isDoctorReq ? [req.user.id] : [],
        );
        // if the appointemtn doctor update the status then his status should be accepted
        if (isDoctorReq) {
          await this.appointmentModelService.updateUserAppointmentStatus(
            appointment.id,
            req.user.id,
            UserAppointmentStatus.ACCEPTED,
          );
        }
        // send invite notification to all parties
        this.appointmentService.sendAppointmentInvite(appointment.id, req.user);
      }
      this.appointmentService.sendAppointmentStatusUpdateToAllParties(
        appointment.id,
        AppointmentStatus.CONFIRMED,
      );
      this.appointmentService.updateReminderForAppointmentUpdate(
        appointment.id,
      );
      return { status: 200, message: 'SUCCESS' };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationAppointmentResourceGuard)
  @Patch(':id/:status')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({
    name: 'status',
    enum: [UserAppointmentStatus.ACCEPTED, UserAppointmentStatus.REJECTED],
    required: true,
  })
  async updateUserAppointmentStatus(
    @Request() req,
    @Param('id') appointmentId: string,
    @Param('status') status: UserAppointmentStatus,
  ) {
    const userAppointment = await this.appointmentModelService.getUserAppointmentData(
      appointmentId,
      req.user.id,
    );
    if (!userAppointment) {
      throw new HttpException(
        'Invalid appointment for user',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userAppointment.userStatus === status) {
      throw new HttpException(
        `The appointment is already ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userAppointment.endTime < new Date()) {
      throw new HttpException(
        `The appointment time is up and you cannot update the status`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !this.appointmentService.validateUpdateUserAppointmentStatus(
        status,
        userAppointment.userStatus,
      )
    ) {
      throw new HttpException(
        `You cannot update a ${userAppointment.userStatus} status to ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const previousStatus = userAppointment.userStatus;
    await this.appointmentModelService.updateUserAppointmentStatus(
      appointmentId,
      req.user.id,
      status,
    );
    // if user is the appointment Doctor or Patient
    if (
      (req.user.role === Role.DOCTOR &&
        req.user.id === userAppointment.doctorId) ||
      (req.user.role === Role.PATIENT &&
        req.user.id === userAppointment.patientId)
    ) {
      const [doctorStatus, patientStatus] = await Promise.all([
        this.appointmentModelService.getUserStatus(
          appointmentId,
          userAppointment.doctorId,
        ),
        this.appointmentModelService.getUserStatus(
          appointmentId,
          userAppointment.patientId,
        ),
      ]);
      switch (status) {
        case UserAppointmentStatus.ACCEPTED:
          if (
            doctorStatus === UserAppointmentStatus.ACCEPTED &&
            patientStatus === UserAppointmentStatus.ACCEPTED &&
            (userAppointment.appointmentStatus === AppointmentStatus.PENDING ||
              userAppointment.appointmentStatus ===
                AppointmentStatus.CANCELLED ||
              userAppointment.appointmentStatus === AppointmentStatus.REJECTED)
          ) {
            // If both paties accepts and appointment is in pending OR cancelled OR rejected then it should be confirmed
            if (
              await this.appointmentModelService.isAnyUpComingAppointmentExist({
                doctorId: userAppointment.doctorId,
                patientId: userAppointment.patientId,
                startTime: userAppointment.startTime,
                endTime: userAppointment.endTime,
              })
            ) {
              // revert the updated user status
              await this.appointmentModelService.updateUserAppointmentStatus(
                appointmentId,
                req.user.id,
                previousStatus,
              );
              throw new HttpException(
                `The appointment cannot be accepted and confirmed for the specified time. A confirmed appointment already exists for one of the parties`,
                HttpStatus.CONFLICT,
              );
            }
            // update appointemnt status to confirmed
            await this.appointmentModelService.update(appointmentId, {
              status: AppointmentStatus.CONFIRMED,
            });
            this.appointmentService.sendAppointmentStatusUpdateToAllParties(
              appointmentId,
              AppointmentStatus.CONFIRMED,
            );
            this.appointmentService.addAppointmentReminder(appointmentId);
            // TODO: Appointment notification: Send appointment confirmation to all parties //Done testing pending
          } else if (
            req.user.role === Role.DOCTOR &&
            (userAppointment.appointmentStatus === AppointmentStatus.REJECTED ||
              userAppointment.appointmentStatus === AppointmentStatus.CANCELLED)
          ) {
            /* If the appointment has already been rejected or cancelled and
             when the doctor again accept the appointment, it will result in a new invitation being sent */
            await this.appointmentModelService.update(appointmentId, {
              status: AppointmentStatus.PENDING,
            });
            await this.appointmentModelService.updateAllPartiesStatus(
              appointmentId,
              UserAppointmentStatus.PENDING,
              [req.user.id],
            );
            this.appointmentService.sendAppointmentInvite(
              appointmentId,
              req.user,
            );
            // TODO: Appointment notification: Resend appointment invite to all parties // Done and testing pending
          }
          break;
        case UserAppointmentStatus.REJECTED:
          if (
            userAppointment.appointmentStatus === AppointmentStatus.CONFIRMED
          ) {
            // Rejecting a confirmed appointment by doctor or patient leads to cancelling the appointment
            await this.appointmentModelService.update(appointmentId, {
              status: AppointmentStatus.CANCELLED,
            });
            this.appointmentService.sendAppointmentStatusUpdateToAllParties(
              appointmentId,
              AppointmentStatus.CONFIRMED,
            );
            this.appointmentService.sendAppointmentStatusUpdateToAllParties(
              appointmentId,
              AppointmentStatus.CANCELLED,
            );
            // TODO: Appointment notification: Send appointment cancellation to all parties // Done testing pending
          } else if (
            userAppointment.appointmentStatus === AppointmentStatus.PENDING
          ) {
            // update appointment status to rejected
            await this.appointmentModelService.update(appointmentId, {
              status: AppointmentStatus.REJECTED,
            });
            this.appointmentService.sendAppointmentStatusUpdateToAllParties(
              appointmentId,
              AppointmentStatus.CANCELLED,
              req.user.id,
            );
            // TODO: Appointment notification: Send appointment rejection to all parties // Done with testing pending
          }
          // delete reminder if any reminder is set
          this.appointmentService.updateReminderForAppointmentUpdate(
            userAppointment.appointmentId,
          );
          break;
        default:
          break;
      }
    }
    return { status: 200, message: 'SUCCESS' };
  }

  @UseGuards(JwtAuthGuard, OrganizationAppointmentResourceGuard)
  @Get('video-call/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async getVideoCallToken(@Request() req, @Param('id') appointmentId: string) {
    const userAppointment = await this.appointmentModelService.getUserAppointmentData(
      appointmentId,
      req.user.id,
    );
    if (!userAppointment) {
      throw new HttpException(
        'Invalid appointment for user',
        HttpStatus.BAD_REQUEST,
      );
    }
    const currentTime = new Date();
    const tokenGenerateTime = this.appointmentService.getAppointmentStartTime(
      userAppointment,
    );
    if (
      (userAppointment.appointmentStatus === AppointmentStatus.CONFIRMED ||
        userAppointment.appointmentStatus === AppointmentStatus.IN_PROGRESS ||
        userAppointment.appointmentStatus === AppointmentStatus.COMPLETED) &&
      userAppointment.type === AppointmentType.VIDEO_CALL &&
      tokenGenerateTime <= currentTime &&
      currentTime < new Date(userAppointment.endTime)
    ) {
      const {
        secret,
        salt,
      } = await this.appointmentService.getSecretAndSaltForAppointment(
        userAppointment.appointmentId,
      );
      const tokenExpiry = Math.floor(
        new Date(userAppointment.endTime).getTime() / 1000,
      );
      return {
        appId: this.configService.get('AGORA_APP_ID'),
        channelName: appointmentId,
        videoCall: {
          agoraToken: await this.videoCallService.buildTokenWithUid(
            appointmentId,
            req.user.id,
            1,
            tokenExpiry,
          ),
          uid: req.user.id,
        },
        presentation: {
          agoraToken: await this.videoCallService.buildTokenWithUid(
            appointmentId,
            req.user.id + AGORA_PRESENTATION_MASK_USER_ID,
            1,
            tokenExpiry,
          ),
          uid: req.user.id + AGORA_PRESENTATION_MASK_USER_ID,
        },
        chat: {
          agoraToken: await this.videoCallService.buildChatToken(
            `${req.user.id}-${AGORA_CHAT_MASK_USER_ID}`,
            1,
            tokenExpiry,
          ),
          uid: `${req.user.id}-${AGORA_CHAT_MASK_USER_ID}`,
        },
        encryptionSecrets: { secret, salt },
      };
    } else {
      this.logService.logInfo(
        'Failed to generate agora token for the appointment',
        {
          appointemnt: userAppointment,
          currentTime,
        },
      );
      throw new HttpException(
        `Filed to generate agora Token for the appointment`,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('video-call/notify/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Appointment Id',
  })
  async notifyVideoCallSession(
    @Request() req,
    @Param('id') appointmentId: string,
  ) {
    const appointment = await this.appointmentModelService.findOneDetail(
      appointmentId,
    );
    if (!appointment) {
      throw new HttpException('Invalid appointment ', HttpStatus.BAD_REQUEST);
    }
    const appointmentUser = appointment.appointmentUsers.find(
      (user) => user.userId === req.user.id,
    );
    if (!appointmentUser) {
      throw new HttpException(
        'Invalid appointment for user',
        HttpStatus.BAD_REQUEST,
      );
    }
    const currentTime = new Date();
    const appointmentStartTime = this.appointmentService.getAppointmentStartTime(
      appointment,
    );
    if (
      (appointment.status === AppointmentStatus.CONFIRMED ||
        appointment.status === AppointmentStatus.IN_PROGRESS ||
        appointment.status === AppointmentStatus.COMPLETED) &&
      appointment.type === AppointmentType.VIDEO_CALL &&
      appointmentStartTime <= currentTime &&
      currentTime < new Date(appointment.endTime)
    ) {
      const notifyUsersId = [];
      const notifyUsersEmail = [];
      appointment.appointmentUsers.forEach((user) => {
        if (user.user && user.user.id != req.user.id) {
          notifyUsersId.push(user.user.id);
          notifyUsersEmail.push(user.user.email);
        }
      });
      const notificationMessage = await this.notificationService.createNotificationMessage(
        {
          ...NOTIFICATION_EVENTS.NOTIFY_JOIN_VIDEO_CALL_APPOINTMENT,
          notificationType: NotificationType.PUSH,
        },
        { START_TIME: appointment.startTime },
      );
      // send push notification
      this.notificationService.generateNotification(
        {
          ...notificationMessage,
          actorId: req.user.id,
          payload: {
            appointemntId: appointment.id,
          },
        },
        notifyUsersId,
        NOTIFICATION_EVENTS.NOTIFY_JOIN_VIDEO_CALL_APPOINTMENT,
        true, // send push
        false, // exclude in inbox
      );
      // send Email notification
      this.emailService.sendEmail({
        to: notifyUsersEmail,
        subject: notificationMessage.messageTitle,
        templateName: 'appointment_notifier.ejs',
        context: {
          startTime: appointment.startTime,
        },
      });
      return {
        message: 'Success',
      };
    } else {
      this.logService.logInfo('Failed to notify other appointment parties', {
        appointemnt: appointment,
        currentTime,
      });
      throw new HttpException(
        `Failed to notify other appointment parties`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // TODO: Delete enpoint after testing. Only for demo purpose
  @UseGuards(JwtAuthGuard)
  @Get('/test/video-call-token')
  async getVideoCallTestToken(@Request() req) {
    const tokenExpiry = Math.floor(Date.now() / 1000) + 7200;
    const chanelId = '67b86bda-1a94-478c-8e1f-d76b6035ba96';
    return {
      appId: this.configService.get('AGORA_APP_ID'),
      channelName: chanelId,
      videoCall: {
        agoraToken: await this.videoCallService.buildTokenWithUid(
          chanelId,
          req.user.id,
          1,
          tokenExpiry,
        ),
        uid: req.user.id,
      },
      presentation: {
        agoraToken: await this.videoCallService.buildTokenWithUid(
          chanelId,
          req.user.id + AGORA_PRESENTATION_MASK_USER_ID,
          1,
          tokenExpiry,
        ),
        uid: req.user.id + AGORA_PRESENTATION_MASK_USER_ID,
      },
      chat: {
        agoraToken: await this.videoCallService.buildChatToken(
          `${req.user.id}-${AGORA_CHAT_MASK_USER_ID}`,
          1,
          tokenExpiry,
        ),
        uid: `${req.user.id}-${AGORA_CHAT_MASK_USER_ID}`,
      },
    };
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.appointmentService.remove(+id);
  // }
}
