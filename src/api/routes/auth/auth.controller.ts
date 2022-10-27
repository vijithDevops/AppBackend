import { User } from './../../../models/user/entity/user.entity';
import { OrganizationSettingsModelService } from './../../../models/organization-settings/organization-settings.model.service';
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Req,
  UsePipes,
  HttpException,
  HttpStatus,
  BadRequestException,
  forwardRef,
  Inject,
  Query,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/role.decorator';
import { RolesGuard } from '../../../common/guards/role.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super_admin.guard';
import { Role } from '../../../models/user/entity/user.enum';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  DeregisterClientPatientDto,
  LoginUserDto,
  RegisterClientPatientDto,
  RegisterClinicalTrialDto,
  RegisterPatientOrCaretakerDto,
  SuperCreateAdminDto,
} from '../user/dto';
import { SensorService } from './../sensor/sensor.service';
import { PatientInfoModelService } from 'src/models/patient_info/patient_info.model.service';
import { LocalAuthGuard } from '../../../common/guards/local-auth.guard';
import {
  CreateUserSchema,
  CreatePatientOrCaretakerSchema,
  SuperCreateAdminSchema,
  RegisterClientPatientSchema,
  RegisterClinicalTrialSchema,
} from './schemas';
import { JoiValidationPipe } from '../../../common/validators/joi.validator';
import { UserModelService } from '../../../models/user/user.model.service';
import { UserService } from '../user/user.service';
import { OrganizationModelService } from '../../../models/organization/organization.model.service';
import { LogService } from 'src/services/logger/logger.service';
import {
  LogoutUserDto,
  VerifyCodeDto,
  UserBlockTokenDto,
  AccountBlockPasswordChangeDto,
  VerifyUserEmailTokenDto,
  VerifyEmailDto,
  UpdateClinicalTrialEmailDto,
} from './dto';
import { UserAppDeviceModelService } from '../../../models/user_app_device/user_app_device.model.service';
import { UserOrganizationAccessGuard } from 'src/common/guards/user_organizaton_access.guard';
import { OrganizationFilterGuard } from 'src/common/guards/organization_filter.guard';
import { generatePassword } from 'src/common/utils/helpers';
import { DeviceConnectionMode } from 'src/models/sensor/entity/sensor.enum';
import * as bcrypt from 'bcrypt';
import { OrganizationClientAuthGuard } from 'src/common/guards/organization_client_auth.guard';
import { REFRESH_TOKEN_KEY } from 'src/config/constants';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => SensorService))
    private readonly sensorService: SensorService,
    private readonly userModelService: UserModelService,
    private readonly patientInfoModelService: PatientInfoModelService,
    private readonly organizationModelService: OrganizationModelService,
    private readonly organizationSettingsModelService: OrganizationSettingsModelService,
    private readonly userAppDeviceModelService: UserAppDeviceModelService,
    private logService: LogService,
  ) {}

  @Post('/register')
  @UsePipes(new JoiValidationPipe(CreatePatientOrCaretakerSchema))
  @ApiBody({
    type: RegisterPatientOrCaretakerDto,
    description: 'Registration for patient and caretaker',
  })
  async register(
    @Body() registerPatientOrCaretakerDto: RegisterPatientOrCaretakerDto,
  ) {
    if (registerPatientOrCaretakerDto.verificationCode) {
      await this.authService.checkCreateUserVerification(
        registerPatientOrCaretakerDto.organizationId,
        registerPatientOrCaretakerDto.verificationCode,
      );
    }
    this.authService.validatePassword(registerPatientOrCaretakerDto.password);
    const newUser = await this.authService
      .createUser(registerPatientOrCaretakerDto)
      .catch((err) => {
        throw err;
      });
    try {
      await this.authService.createUserRoleSpecificDetails(
        newUser,
        registerPatientOrCaretakerDto,
      );
    } catch (error) {
      if (newUser) {
        await this.userModelService.remove(newUser.id);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    delete newUser.password;
    // send mail to verify email
    this.authService.sendEmailVerification(newUser);
    //create user in connecty cube to access chat
    this.authService.createAndUpdateChatId(newUser);
    return newUser;
  }

  @Post('/register/client-patient')
  @UsePipes(new JoiValidationPipe(RegisterClientPatientSchema))
  @ApiBody({
    type: RegisterClientPatientDto,
    description:
      'Registration for third party client to register their patients',
  })
  async registerClientPatient(@Body() dto: RegisterClientPatientDto) {
    const organization = await this.organizationModelService
      .findOneByAccessCode(dto.reg_code)
      .catch(() => {
        throw new BadRequestException('Invalid registration code');
      });
    if (!organization.organizationSettings.apiEnabled) {
      throw new HttpException(
        'Cannot register patient. Please contact admin',
        HttpStatus.FORBIDDEN,
      );
    }
    if (await this.userModelService.isUsernameExist(dto.patient_id)) {
      throw new BadRequestException('Username already taken by another user !');
    }
    const appSensor = await this.authService.validateSensorOnPatientRegisteration(
      dto.sensor_id,
      organization.id,
    );
    const patientData = {
      username: dto.patient_id,
      password: generatePassword(),
      role: Role.PATIENT,
      isClientPatient: true,
      organizationId: organization.id,
    };
    const patient = await this.userModelService
      .createUser({ ...patientData })
      .catch((err) => {
        this.logService.logError('Failed to Register client patient', err);
        throw this.authService.handleCreateUserErrorMessage(err);
      });
    try {
      const patientInfoData = {
        userId: patient.id,
      };
      const patientInfo = await this.patientInfoModelService
        .createPatientInfo(patientInfoData)
        .catch((err) => {
          throw err;
        });
      patient.patientInfo = patientInfo;
      // assigning sensor defaultly on application mode
      await this.sensorService.assignSensorPatient(
        appSensor,
        patient,
        DeviceConnectionMode.APPLICATION_MODE,
      );
    } catch (error) {
      if (patient) {
        await this.userModelService.remove(patient.id);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    // update patient registraion on 3rd party
    this.authService.sendPatientRegistrationToThirdParty(
      organization.organizationSettings.clientUrl,
      {
        patient_id: patient.patientInfo.patientId,
        sensor_id: appSensor.macId,
        username: patient.username,
        password: patientData.password,
      },
    );
    delete patient.password;
    //create user in connecty cube to access chat
    this.authService.createAndUpdateChatId(patient);
    return patient;
  }

  @UseGuards(OrganizationClientAuthGuard)
  @Post('/deregister/client-patient')
  @ApiBody({
    type: DeregisterClientPatientDto,
    description:
      'Deregister for third party client to unassign sensor from patient',
  })
  @ApiHeader({
    name: 'auth-token',
    description: 'Use the secret auth token to authorize the request',
    required: true,
  })
  async deregisterClientPatient(
    @Req() req,
    @Body() dto: DeregisterClientPatientDto,
  ) {
    const patient = await this.userModelService.findOneByUsername(
      dto.patient_id,
      { role: Role.PATIENT, organizationId: req.organization.id },
    );
    if (!patient) {
      throw new BadRequestException('Invalid patient in organziation');
    }
    if (
      !patient.patientInfo.sensors ||
      patient.patientInfo.sensors.length <= 0 ||
      patient.patientInfo.sensors[0].connectionMode !==
        DeviceConnectionMode.APPLICATION_MODE ||
      patient.patientInfo.sensors[0].macId !== dto.sensor_id
    ) {
      throw new BadRequestException(
        'Invalid sensor attached to the patient in app mode',
      );
    }
    await this.sensorService.unassignSensorPatientOffline(
      patient.patientInfo.sensors[0],
    );
    return {
      message: 'Successfully dergistered the sensor from patient',
    };
  }

  @Post('/register/clinical-trial')
  @UsePipes(new JoiValidationPipe(RegisterClinicalTrialSchema))
  @ApiBody({
    type: RegisterClinicalTrialDto,
    description:
      'Register patients by clinical trial for clinical trial enabled organizaton',
  })
  async registerClinicalTrial(@Body() dto: RegisterClinicalTrialDto) {
    const organization = await this.authService.validateOrganziationById(
      dto.organizationId,
    );
    if (!organization.organizationSettings.clinicalTrial) {
      throw new HttpException(
        'Clinical trial registration is not availble.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (await this.userModelService.isUsernameExist(dto.username)) {
      throw new BadRequestException('Username already taken by another user !');
    }
    const patientData = {
      username: dto.username,
      password: this.authService.getPasswordForClinicalTrial(organization),
      role: Role.PATIENT,
      isClinicalTrialUser: true,
      organizationId: organization.id,
    };
    const patient = await this.userModelService
      .createUser({ ...patientData })
      .catch((err) => {
        this.logService.logError(
          'Failed to Register patient for clinical trial',
          err,
        );
        throw this.authService.handleCreateUserErrorMessage(err);
      });
    try {
      const patientInfoData = {
        userId: patient.id,
      };
      await this.patientInfoModelService
        .createPatientInfo(patientInfoData)
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      if (patient) {
        await this.userModelService.remove(patient.id);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    delete patient.password;
    //create user in connecty cube to access chat
    this.authService.createAndUpdateChatId(patient);
    return patient;
  }

  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    OrganizationFilterGuard,
    UserOrganizationAccessGuard,
  )
  @Post('/create-user')
  @UsePipes(new JoiValidationPipe(CreateUserSchema))
  @ApiBody({
    type: CreateUserDto,
    description:
      'Admin can create all roles but clinicians cannot create admin role',
  })
  async createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
    if (req.user.role !== Role.ADMIN && createUserDto.role === Role.ADMIN) {
      throw new HttpException(
        'Unauthorized to create admin role',
        HttpStatus.UNAUTHORIZED,
      );
    }
    this.authService.validatePassword(createUserDto.password);
    const newUser = await this.authService
      .createUser(createUserDto)
      .catch((err) => {
        throw err;
      });
    try {
      await this.authService.createUserRoleSpecificDetails(
        newUser,
        createUserDto,
      );
    } catch (error) {
      if (newUser) {
        await this.userModelService.remove(newUser.id);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    delete newUser.password;
    this.authService.sendEmailVerification(newUser);
    // create user in connecty cube to access chat
    this.authService.createAndUpdateChatId(newUser);
    return newUser;
  }

  @Post('/super-create-admin')
  @UseGuards(SuperAdminGuard)
  @UsePipes(new JoiValidationPipe(SuperCreateAdminSchema))
  @ApiBody({
    type: SuperCreateAdminDto,
    description: 'Create super admin without jwt key',
  })
  async createSuperAdmin(
    @Req() req,
    @Body() superCreateAdminDto: SuperCreateAdminDto,
  ) {
    this.authService.validatePassword(superCreateAdminDto.password);
    const data = {
      ...superCreateAdminDto,
      role: Role.ADMIN,
    };
    const newUser = await this.authService.createUser(data).catch((err) => {
      throw err;
    });
    delete newUser.password;
    // create user in connecty cube to access chat
    this.authService.createAndUpdateChatId(newUser);
    return newUser;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user: User = req.user;
    if (
      !user.isEmailVerified &&
      !(user.isClinicalTrialUser || user.isClientPatient)
    ) {
      throw new UnauthorizedException('Please verify your email to proceed');
    }
    if (user.role !== Role.ADMIN) {
      const orgSettings = await this.organizationSettingsModelService.findByOrganization(
        user.organization,
      );
      user.organization.organizationSettings = orgSettings;
    }
    if (!user.chatId) {
      this.authService.createAndUpdateChatId(user);
    }
    await this.authService.setLoginRefreshToken(res, user);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(
    @Body() logoutUserDto: LogoutUserDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    let deviceCleared = false;
    const userDevice = await this.userAppDeviceModelService.findOneUserDevice({
      userId: req.user.id,
      deviceType: logoutUserDto.deviceType,
      deviceToken: logoutUserDto.deviceToken,
    });
    if (userDevice) {
      await this.userAppDeviceModelService.remove(userDevice.id);
      deviceCleared = true;
      this.logService.logInfo(`User ${req.user.username} logged out`);
    } else {
      this.logService.logInfo('No device found for user logout ', {
        user: { id: req.user.id, username: req.user.username },
        logoutUserDto,
      });
    }
    await this.authService.deleteLoginRefreshToken(res);
    return {
      message: 'Success',
      deviceCleared,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Post('/refresh')
  async refreshLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_KEY];
      const decoded = await this.authService
        .verifyRefreshJwtToken(refreshToken)
        .catch(() => {
          throw new UnauthorizedException();
        });
      if (!decoded) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.userModelService.findOneByUsername(
        decoded.username,
      );
      await this.authService.deleteLoginRefreshToken(res);
      await this.authService.setLoginRefreshToken(res, user);
      return this.authService.login(user);
    } catch (error) {
      throw error;
    }
  }

  @Post('/verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    // if (await this.authService.verifyRegistrationCode(verifyCodeDto.code)) {
    //   return {
    //     message: 'Code verified successfully',
    //   };
    // } else {
    //   throw new BadRequestException('Incorrect verification code');
    // }
    const organization = await this.organizationModelService
      .findOneByAccessCode(verifyCodeDto.code)
      .catch(() => {
        throw new BadRequestException('Invalid registration code');
      });
    return {
      message: 'Code verified successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        organizationSettings: {
          clinicalTrial:
            organization.organizationSettings &&
            organization.organizationSettings.clinicalTrial
              ? organization.organizationSettings.clinicalTrial
              : false,
        },
      },
    };
  }

  @ApiBody({
    type: UserBlockTokenDto,
    description: 'Verify token of blocked user for unblocking / password-reset',
  })
  @Post('/user/account/verify-reset-token')
  async verifyUserAccountResetToken(@Body() verifyTokenDto: UserBlockTokenDto) {
    try {
      const user = await this.authService.verifyUserAccountResetToken(
        verifyTokenDto.token,
      );
      delete user.id;
      return user;
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({
    type: UserBlockTokenDto,
    description: 'Unblock/Unlock user account using token',
  })
  @Post('/user/account/un-block')
  async unblockBlockedUser(@Body() unblockUserAccountDto: UserBlockTokenDto) {
    try {
      const user = await this.authService.verifyUserAccountResetToken(
        unblockUserAccountDto.token,
      );
      await this.userModelService.resetBlockedUserAccount(user.id);
      return {
        status: 200,
        message:
          'Account reactivated successfully. You can now login with your old password',
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({
    type: AccountBlockPasswordChangeDto,
    description: 'Change user password by user block token',
  })
  @Post('/user/account/change-password')
  async verifyUSerBlockToken(
    @Body() accountBlockPasswordChangeDto: AccountBlockPasswordChangeDto,
  ) {
    try {
      const user = await this.authService.verifyUserAccountResetToken(
        accountBlockPasswordChangeDto.token,
      );
      this.authService.validatePassword(
        accountBlockPasswordChangeDto.newPassword,
      );
      const userPassword = await this.userModelService.findUserPasswordById(
        user.id,
      );
      if (
        await bcrypt.compare(
          accountBlockPasswordChangeDto.newPassword,
          userPassword.password,
        )
      ) {
        throw new BadRequestException(
          'New password cannot be the same as the previous password',
        );
      }
      await this.userModelService.updateUserPassword(
        user.id,
        accountBlockPasswordChangeDto.newPassword,
      );
      await this.userModelService.resetBlockedUserAccount(user.id);
      return {
        status: 200,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/account/verify-email-token')
  async verifyUserEmailToken(@Query() params: VerifyUserEmailTokenDto) {
    try {
      const user = await this.authService.validateEmailVerificationToken(
        params.id,
      );
      delete user.id;
      return user;
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({
    type: VerifyEmailDto,
    description: 'verify email or submit terms and conditions',
  })
  @Post('/user/account/verify-email')
  async verifyUserEmail(@Body() dto: VerifyEmailDto) {
    try {
      const user = await this.authService.validateEmailVerificationToken(
        dto.id,
      );
      if (user.isClinicalTrialUser || user.isClientPatient) {
        if (!dto.password) {
          throw new BadRequestException(
            'Password is required for clinical trial verification',
          );
        } else {
          this.authService.validatePassword(dto.password);
        }
      }
      await this.userModelService.verifyEmailAndAcceptTAndC(
        dto.id,
        dto.password ? dto.password : null,
      );
      return {
        message: 'Email verified successfully',
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiBody({
    type: UpdateClinicalTrialEmailDto,
    description:
      'Update Email of clinical trial user and send verification Email',
  })
  @Post('/user/clinical-trial/update-email')
  async updateClinicalTrialUserEmail(@Body() dto: UpdateClinicalTrialEmailDto) {
    try {
      const user = await this.userModelService.getUserByTemperoryToken(
        dto.authToken,
      );
      if (!user) {
        throw new UnauthorizedException();
      }
      if (!user.email || user.email !== dto.email) {
        await this.userModelService.update(user.id, { email: dto.email });
        user.email = dto.email;
      }
      await this.authService.sendEmailVerification(user);
    } catch (error) {
      throw error;
    }
  }
}
