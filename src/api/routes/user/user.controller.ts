import { ClinicianNoteModelService } from 'src/models/clinician_note/clinician_note.model.service';
import { OrganizationSettingsModelService } from './../../../models/organization-settings/organization-settings.model.service';
import {
  Get,
  Delete,
  Body,
  UseGuards,
  Param,
  Controller,
  Request,
  Query,
  HttpException,
  HttpStatus,
  Post,
  Patch,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { User } from '../../../models/user/entity/user.entity';
import { UserService } from './user.service';
import {
  AddOrRemovePatientFromWatchlistDto,
  AddPatientSupervisorDto,
  ChangePasswordDto,
  DeletePatientSupervisorDto,
  getPatientCareTeam,
  OrganizationCareteamList,
  PatientComplianceResponseDto,
  UpdateDoctorInchargeDto,
  UpdateUserDto,
  UserAssignedPatientListPaginated,
  UserBadgesResponseDto,
  UserListPaginated,
} from './dto';
import { Roles } from '../../../common/decorators/role.decorator';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { UserResourceGuard } from '../../../common/guards/user_resource.guard';
import { getPagination } from '../../../common/utils/entity_metadata';
import {
  ApiParam,
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NotificationService } from '../../../services/notification/notification.service';
import { NOTIFICATION_EVENTS } from '../../../config/master-data-constants';
import { UserModelService } from 'src/models/user/user.model.service';
import { PatientInfoModelService } from 'src/models/patient_info/patient_info.model.service';
import { DoctorInfoModelService } from '../../../models/doctor_info/doctor_info.model.service';
import { CaretakerInfoModelService } from '../../../models/caretaker_info/caretaker_info.model.service';
import { PatientSupervisionMappingModelService } from '../../../models/patient_supervision_mapping/patient_supervision_mapping.model.service';
import { NotificationType } from 'src/models/notification_event_master/entity/notification_event.enum';
import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { LogService } from 'src/services/logger/logger.service';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { OrganizationUserResourceGuard } from 'src/common/guards/organization_user_resource.guard';
import { OrganizationPatientResourceGuard } from 'src/common/guards/organization_patient_resource.guard';
import { validatePasswordRegex } from 'src/common/utils/validators';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly userModelService: UserModelService,
    private readonly organizationSettingsModelService: OrganizationSettingsModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly doctorInfoModelService: DoctorInfoModelService,
    private readonly clinicianNoteModelService: ClinicianNoteModelService,
    private readonly caretakerInfoModelService: CaretakerInfoModelService,
    private readonly patientSupervisionMappingModelService: PatientSupervisionMappingModelService,
    private logService: LogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async userProfile(@Request() req) {
    const userData = await this.userModelService.findOneDetails(req.user.id);
    if (
      userData &&
      userData.role !== Role.ADMIN &&
      !userData.organization.organizationSettings
    ) {
      //create organization settings
      const defaultSettings = await this.organizationSettingsModelService.create(
        userData.organization,
      );
      userData.organization.organizationSettings = defaultSettings;
    }
    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Get('home')
  async userHomePAge(@Request() req) {
    const userData = await this.userModelService.findOneDetails(req.user.id);
    const returnDate = {};
    if ((userData.role = Role.PATIENT)) {
      returnDate[
        'latestDoctorNotes'
      ] = await this.clinicianNoteModelService.getLatestNoteOfPatient(
        userData.id,
      );
    }
    return returnDate;
  }

  @ApiOperation({
    description: 'API to get user badges count',
  })
  @ApiOkResponse({
    type: UserBadgesResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('badges')
  async getUserBadgesCount(@Request() req) {
    return {
      notification: await this.notificationService.getUnacknowledgedNotificationCount(
        req.user.id,
      ),
      unReadNotification: await this.notificationService.getUnreadNotificationCount(
        req.user.id,
      ),
    };
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE, Role.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Get('/')
  // TODO: Restrict patient role for fetching other patient and caretakers details
  async getAllUsers(@Request() req, @Query() queryParams: UserListPaginated) {
    const {
      role,
      search,
      sort,
      field,
      excludeIds,
      organizationId,
      isOnWatchlist,
      gatewayFilter,
      sensorFilter,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.userModelService.findAllPaginateAndFilter({
      skip,
      limit,
      search,
      organizationId,
      isOnWatchlist,
      gatewayFilter,
      sensorFilter,
      fields: Array.isArray(field) ? field : field ? [field] : [],
      sorts: Array.isArray(sort) ? sort : sort ? [sort] : [],
      excludeUserIds: Array.isArray(excludeIds)
        ? excludeIds
        : excludeIds
        ? [excludeIds]
        : [],
      roles: Array.isArray(role) ? role : role ? [role] : [],
      excludeRoles:
        req.user.role !== Role.ADMIN
          ? req.user.role === Role.PATIENT || req.user.role === Role.CARETAKER
            ? [Role.ADMIN, Role.PATIENT, Role.CARETAKER]
            : [Role.ADMIN]
          : [],
    });
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get('/basic-info')
  async getUsersBasicInfoList(
    @Request() req,
    @Query() queryParams: UserListPaginated,
  ) {
    const {
      role,
      search,
      sort,
      field,
      excludeIds,
      organizationId,
      isOnWatchlist,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.userModelService.findAllBasicInfoPaginateAndFilter({
      skip,
      limit,
      search,
      fields: Array.isArray(field) ? field : field ? [field] : [],
      sorts: Array.isArray(sort) ? sort : sort ? [sort] : [],
      organizationId,
      isOnWatchlist,
      excludeUserIds: Array.isArray(excludeIds)
        ? excludeIds
        : excludeIds
        ? [excludeIds]
        : [],
      roles: Array.isArray(role) ? role : role ? [role] : [],
      excludeRoles:
        req.user.role !== Role.ADMIN
          ? req.user.role === Role.PATIENT || req.user.role === Role.CARETAKER
            ? [Role.ADMIN, Role.PATIENT, Role.CARETAKER]
            : [Role.ADMIN]
          : [],
    });
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:userId')
  @ApiParam({ name: 'userId', type: String, required: true })
  async getUser(@Request() req, @Param() params): Promise<User> {
    try {
      const user = await this.userModelService.findOneDetails(params.userId);
      if (!user) {
        // show basic deletails, if the user profile is deleted
        const deletedUser = await this.userModelService.getDeletedUser(
          params.userId,
        );
        if (!deletedUser) {
          throw new HttpException(
            'Invalid user profile',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
          req.user.role !== Role.ADMIN &&
          deletedUser.organizationId !== req.user.organizationId
        ) {
          throw new ForbiddenException();
        }
        return deletedUser;
      } else {
        if (
          req.user.role !== Role.ADMIN &&
          user.organizationId !== req.user.organizationId
        ) {
          throw new ForbiddenException();
        }
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, UserResourceGuard, OrganizationUserResourceGuard)
  @Patch('/:userId')
  @ApiParam({ name: 'userId', type: String, required: true })
  async updateUser(@Param() params, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userModelService.findOne(params.userId);
    try {
      if (updateUserDto.username && updateUserDto.username != user.username) {
        if (
          await this.userModelService.isUsernameExist(updateUserDto.username)
        ) {
          throw new BadRequestException(
            'Username already taken by another user !',
          );
        }
      }
      await this.userModelService.update(user.id, updateUserDto);
      switch (user.role) {
        case 'doctor':
          if (updateUserDto.specialization) {
            await this.doctorInfoModelService.updateDoctorInfo(user.id, {
              specialization: updateUserDto.specialization,
            });
          }
          break;
        case 'patient':
          if (updateUserDto.doctorInchargeId) {
            await this.userModelService
              .validateOrganizationOfUsers(
                [updateUserDto.doctorInchargeId],
                user.organizationId,
              )
              .catch(() => {
                throw new HttpException(
                  'Invalid doctor in the Organization',
                  HttpStatus.BAD_REQUEST,
                );
              });
            await this.userService
              .updatePatientDoctorIncharge(
                user.id,
                updateUserDto.doctorInchargeId,
              )
              .catch((err) => {
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
              });
          }
          await this.patientInfoModelService.updatePatientInfo(
            user.id,
            this.userService.getUpdatePatientInfoObj(updateUserDto),
          );
          break;
        case 'caretaker':
          if (updateUserDto.relationship) {
            await this.caretakerInfoModelService.updateCaretakerInfo(user.id, {
              relationship: updateUserDto.relationship,
            });
          }
        default:
          break;
      }
      return { status: 200, message: 'SUCCESS' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    UserResourceGuard,
    OrganizationUserResourceGuard,
  )
  @Delete('/:userId')
  @ApiParam({ name: 'userId', type: String, required: true })
  async deleteUser(@Param() params): Promise<void> {
    const user = await this.userModelService.findOneForDelete(params.userId);
    if (user) {
      if (
        user.role === Role.PATIENT &&
        ((user.patientInfo.gateways && user.patientInfo.gateways.length > 0) ||
          (user.patientInfo.sensors && user.patientInfo.sensors.length > 0))
      ) {
        throw new HttpException(
          'Please unassign the device from patient before deleting',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.userModelService.softDelete(params.userId);
    } else {
      throw new BadRequestException('Invalid user');
    }
  }

  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('/patient/:patientId')
  @ApiParam({ name: 'patientId', type: String, required: true })
  async findOnePatient(@Param() params): Promise<User> {
    return await this.userModelService.findOnePatientDetails(params.patientId);
  }

  @UseGuards(JwtAuthGuard, PatientResourceGuard, OrganizationUserResourceGuard)
  @Get('/patient/care-team/:patientId')
  @ApiParam({ name: 'patientId', type: String, required: true })
  async getPatientCareTeam(
    @Request() req,
    @Query() queryParams: getPatientCareTeam,
    @Param('patientId') patientId: string,
  ) {
    const { search, excludeIds, roles } = queryParams;
    return await this.userModelService.getPatientCareTeam(patientId, {
      search,
      excludeUserIds: Array.isArray(excludeIds)
        ? excludeIds
        : excludeIds
        ? [excludeIds]
        : [],
      roles: Array.isArray(roles) ? roles : roles ? [roles] : [],
    });
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/patient/add-supervisor')
  async addPatientSupervisor(
    @Request() req,
    @Body() addPatientSupervisorDto: AddPatientSupervisorDto,
  ) {
    try {
      const supervisorIds = addPatientSupervisorDto.userIds;
      const [patientData] = await Promise.all([
        this.userService.validateAndFindUsersById(
          [addPatientSupervisorDto.patientId],
          [Role.PATIENT],
        ),
        this.userService.validateAndFindUsersById(
          addPatientSupervisorDto.userIds,
          [Role.DOCTOR, Role.NURSE],
        ),
      ]);
      // check patient Organization with the supervisors Organization
      await this.userModelService
        .validateOrganizationOfUsers(
          supervisorIds,
          patientData[0].organizationId,
        )
        .catch(() => {
          throw new HttpException(
            'Supervisors must belongs to the same Organization of patient',
            HttpStatus.BAD_REQUEST,
          );
        });
      const patientSupervisorMappingObject = supervisorIds.map((userId) => {
        return {
          patientId: addPatientSupervisorDto.patientId,
          userId,
        };
      });
      const createData = await this.patientSupervisionMappingModelService
        .assignSupervisors(patientSupervisorMappingObject)
        .catch((err) => {
          this.logService.logError(
            'Failed to create patient Supervision mapping',
            err,
          );
          throw new HttpException(
            'Failed to add supervisors',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        });
      const message = await this.notificationService.createNotificationMessage(
        {
          ...NOTIFICATION_EVENTS.INVITE_NEW_CARE_TEAM,
          notificationType: NotificationType.PUSH,
        },
        {
          PATIENT_NAME: patientData[0].firstName,
          LINK: '',
        },
      );
      this.notificationService.generateNotification(
        {
          ...message,
          actorId: req.user.id,
          payload: {
            patientId: patientData[0].id,
          },
        },
        addPatientSupervisorDto.userIds,
        NOTIFICATION_EVENTS.INVITE_NEW_CARE_TEAM,
      );
      return createData;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Delete('/patient/supervisor')
  async deletePatientSupervisor(
    @Request() req,
    @Query() deletePatientSupervisorDto: DeletePatientSupervisorDto,
  ) {
    try {
      const mappingData = await this.patientSupervisionMappingModelService.getSuperVisorMapping(
        deletePatientSupervisorDto.patientId,
        deletePatientSupervisorDto.userId,
      );
      if (!mappingData || !mappingData.patient || !mappingData.user) {
        throw new HttpException(
          'Careteam user not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.patientSupervisionMappingModelService.deleteById(
        mappingData.id,
      );
      if (mappingData.user.role === Role.CARETAKER) {
        await this.caretakerInfoModelService.removePatient(mappingData.userId);
      }
      return {
        message: 'Successfully removed user from patient careteam',
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Patch('/patient/doctor-incharge')
  async updatePatientDoctorIncharge(
    @Body() updateDoctorInchargeDto: UpdateDoctorInchargeDto,
  ) {
    try {
      const mappingData = await this.patientSupervisionMappingModelService.findOneById(
        updateDoctorInchargeDto.supervisorMappingId,
        updateDoctorInchargeDto.patientId,
      );
      if (!mappingData) {
        throw new HttpException(
          'Invalid supervisor mapping for patient',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (mappingData.user && mappingData.user.role !== Role.DOCTOR) {
        throw new HttpException(
          'Failed to update a non Doctor profile as incharge',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!mappingData.isIncharge) {
        const existingIncharge = await this.patientSupervisionMappingModelService.getDoctorInCharge(
          mappingData.patientId,
        );
        const updatePromises = [
          this.patientSupervisionMappingModelService.updateInchargeByMappingId(
            mappingData.id,
            true,
          ),
        ];
        if (existingIncharge) {
          updatePromises.push(
            this.patientSupervisionMappingModelService.updateInchargeByMappingId(
              existingIncharge.id,
              false,
            ),
          );
        }
        await Promise.all(updatePromises);
      }
      // if (
      //   mappingData.isIncharge === true &&
      //   updateDoctorInchargeDto.isIncharge === false
      // ) {
      //   const otherInchargeCount = await this.patientSupervisionMappingModelService.getInchargeCountOfPatient(
      //     mappingData.patientId,
      //     [mappingData.userId],
      //   );
      //   if (!otherInchargeCount) {
      //     throw new HttpException(
      //       'Patient must have a doctor incharge',
      //       HttpStatus.BAD_REQUEST,
      //     );
      //   }
      // }
      // await this.patientSupervisionMappingModelService.updateInchargeByMappingId(
      //   mappingData.id,
      //   updateDoctorInchargeDto.isIncharge,
      // );
      return await this.patientSupervisionMappingModelService.findPatientSupervisorsDetails(
        mappingData.patientId,
      );
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    description: 'API to get last 30 days patient compliance',
  })
  @ApiOkResponse({
    type: PatientComplianceResponseDto,
  })
  @UseGuards(
    JwtAuthGuard,
    PatientResourceGuard,
    OrganizationPatientResourceGuard,
  )
  @Get('patient/compliance/:patientId')
  @ApiParam({ name: 'patientId', type: String, required: true })
  async getPatientCompliance(@Param() params) {
    try {
      const patient = await this.userModelService.findOneById(
        params.patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new HttpException('Invalid patient', HttpStatus.BAD_REQUEST);
      }
      return await this.userService.getPatientCompliance(patient);
    } catch (error) {
      throw error;
    }
  }

  // @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  // @UseGuards(
  //   JwtAuthGuard,
  //   RolesGuard,
  //   UserResourceGuard,
  //   OrganizationUserResourceGuard,
  // )
  // @Get('/patients/assigned')
  // async getUserAssignedPatientListPaginated(
  //   @Request() req,
  //   @Query() queryParams: UserAssignedPatientListPaginated,
  // ) {
  //   const { userId, search, sort, field, ...paginateParams } = queryParams;
  //   const { limit, skip } = getPagination(paginateParams);
  //   return await this.userModelService.getAssignedPatientListPaginateAndFilter({
  //     userId,
  //     skip,
  //     limit,
  //     search,
  //     field,
  //     sort,
  //   });
  // }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    UserResourceGuard,
    OrganizationUserResourceGuard,
  )
  @Get('/patients/assigned/v2')
  async getUserAssignedPatientListPaginatedV2(
    @Request() req,
    @Query() queryParams: UserAssignedPatientListPaginated,
  ) {
    const {
      userId,
      search,
      isOnWatchlist,
      sort,
      field,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.userModelService.getAssignedPatientListPaginateAndFilterV2(
      {
        userId,
        skip,
        limit,
        search,
        isOnWatchlist,
        fields: Array.isArray(field) ? field : field ? [field] : [],
        sorts: Array.isArray(sort) ? sort : sort ? [sort] : [],
      },
    );
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    UserResourceGuard,
    OrganizationUserResourceGuard,
  )
  @Get('/patients/assigned/basic-info')
  async getUserAssignedPatientListBasicPaginated(
    @Request() req,
    @Query() queryParams: UserAssignedPatientListPaginated,
  ) {
    const {
      userId,
      search,
      isOnWatchlist,
      sort,
      field,
      ...paginateParams
    } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.userModelService.getAssignedPatientListBasicInfoPaginateAndFilter(
      {
        userId,
        skip,
        limit,
        search,
        isOnWatchlist,
        fields: Array.isArray(field) ? field : field ? [field] : [],
        sorts: Array.isArray(sort) ? sort : sort ? [sort] : [],
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/password')
  // @UsePipes(new JoiValidationPipe(ChangePasswordSchema))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
        throw new BadRequestException(
          'The old password and the new password should not be the same',
        );
      }
      if (!validatePasswordRegex(changePasswordDto.newPassword)) {
        throw new BadRequestException(
          'Password must contain at least 8 characters, one uppercase,one lowercase,one number and one special case character with no spaces',
        );
      }
      const user = await this.userModelService.findUserPasswordById(
        req.user.id,
      );
      const isMatch = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );
      if (isMatch) {
        await this.userModelService.updateUserPassword(
          user.id,
          changePasswordDto.newPassword,
        );
      } else {
        throw new BadRequestException('Incorrect password');
      }
      return { status: 200, message: 'Password updated successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, OrganizationFilterGuard)
  @Get('/careteam/organization')
  async getOrganizationCareteams(
    @Request() req,
    @Query() queryParams: OrganizationCareteamList,
  ) {
    const { page, perPage, ...filters } = queryParams;
    const { limit, skip } = getPagination({ page, perPage });
    if (req.user.role === Role.DOCTOR || req.user.role === Role.NURSE) {
      filters['sortUserId'] = req.user.id;
    }
    return await this.userModelService.getPatientListWithCareteam({
      skip,
      limit,
      ...filters,
    });
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationPatientResourceGuard)
  @Post('/patient/watchlist')
  async addOrRemovePatientFromWatchlist(
    @Body() dto: AddOrRemovePatientFromWatchlistDto,
  ) {
    try {
      const patient = await this.userModelService.findOneUserById(
        dto.patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new BadRequestException('Invalid patient');
      }
      if (dto.isOnWatchlist) {
        if (patient.isOnWatchlist === false) {
          await this.userModelService.patchUserById(patient.id, {
            isOnWatchlist: true,
            watchlistedAt: new Date(),
          });
        }
      } else {
        if (patient.isOnWatchlist === true) {
          await this.userModelService.patchUserById(patient.id, {
            isOnWatchlist: false,
            watchlistedAt: null,
          });
        }
      }
      return await this.userModelService.findOneDetails(patient.id);
    } catch (error) {
      throw error;
    }
  }
}
