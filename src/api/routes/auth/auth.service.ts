import { JWTService } from './../../../services/jwt-service/jwt-service.service';
import { generateTokenString } from './../../../common/utils/helpers';
import { OrganizationSettingsModelService } from './../../../models/organization-settings/organization-settings.model.service';
import { ThirdPartyService } from './../../../services/third-party-services/third-party.service';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from 'src/models/user/entity/user.entity';
import { ChatService } from 'src/services/chat/chat.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { LogService } from 'src/services/logger/logger.service';
import { CreateUserDto, RegisterPatientOrCaretakerDto } from '../user/dto';
import { UserService } from '../user/user.service';
import { Role } from 'src/models/user/entity/user.enum';
import { ConfigService } from '@nestjs/config';
import { OrganizationModelService } from '../../../models/organization/organization.model.service';
import { ConstantsModelService } from 'src/models/constants/constants.module.service';
import { CONSTANT_KEYS } from 'src/config/master-data-constants';
import { SensorModelService } from 'src/models/sensor/sensor.model.service';
import { Sensor } from 'src/models/sensor/entity/sensor.entity';
import { ISendThirPartyPatientCredentials } from './interfaces';
import { Organization } from 'src/models/organization/entity/organization.entity';
import { validatePasswordRegex } from 'src/common/utils/validators';
import { addDays } from 'src/common/utils/date_helper';
import {
  LOGIN_FAILED_ATTEMPTS_TO_BLOCK,
  PASSWORD_BRUTE_lOCK_DAYS,
  REFRESH_TOKEN_KEY,
  USER_CHNAGE_PASSWORD_LINK,
  USER_EMAIL_VERIFICATION_LINK,
  USER_UNLOCK_LINK,
} from 'src/config/constants';
import { EmailService } from 'src/services/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userModelService: UserModelService,
    private userService: UserService,
    private jwtService: JWTService,
    private readonly chatService: ChatService,
    private logService: LogService,
    private configService: ConfigService,
    private thirdPartyService: ThirdPartyService,
    private organizationModelService: OrganizationModelService,
    private organizationSettingsModelService: OrganizationSettingsModelService,
    private readonly constantsModelService: ConstantsModelService,
    private readonly sensorModelService: SensorModelService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(
    dto: RegisterPatientOrCaretakerDto | CreateUserDto,
  ): Promise<User> {
    try {
      if (await this.userModelService.isUsernameExist(dto.username)) {
        throw new BadRequestException(
          'Username already taken by another user !',
        );
      }
      //TODO: Uncomment the code after testing. For unique email and phone number in Org
      await this.checkUserUniqueFieldsForOrganization(
        {
          email: dto.email,
          phoneNumber: dto.phoneNumber,
        },
        dto.organizationId,
      );
      const userData = {
        username: dto.username,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName || null,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        gender: dto.gender || null,
        address: dto.address,
        role: dto.role,
        organizationId:
          dto.role === Role.ADMIN
            ? (await this.organizationModelService.getAdminOrganization()).id
            : dto.organizationId,
      };
      return await this.userModelService.createUser(userData).catch((err) => {
        // throw new HttpException(err.detail, HttpStatus.CONFLICT);
        this.logService.logError('Failed to create User', err);
        throw this.handleCreateUserErrorMessage(err);
      });
    } catch (error) {
      throw error;
    }
  }

  async checkUserUniqueFieldsForOrganization(
    fields: { email: string; phoneNumber: string },
    organizationId: string,
  ): Promise<void> {
    try {
      const [isEmailExist, isPhoneNumberExist] = await Promise.all([
        this.userModelService.isUserEmailExistForOrganization(
          fields.email,
          organizationId,
        ),
        this.userModelService.isUserPhoneNumberExistForOrganization(
          fields.phoneNumber,
          organizationId,
        ),
      ]);
      if (isEmailExist)
        throw new HttpException(
          'Email already taken by another user',
          HttpStatus.BAD_REQUEST,
        );
      if (isPhoneNumberExist)
        throw new HttpException(
          'Phone number already taken by another user',
          HttpStatus.BAD_REQUEST,
        );
    } catch (error) {
      throw error;
    }
  }

  handleCreateUserErrorMessage(err: {
    message: string;
    detail: any;
  }): HttpException {
    try {
      if (err.message && err.message.includes('duplicate key')) {
        const errorString = err.detail;
        const uniqueKeys = [
          {
            key: 'username',
            name: 'Username',
          },
          {
            key: 'phone_number',
            name: 'Phone Number',
          },
          {
            key: 'email',
            name: 'Email',
          },
        ];
        const errorKey = uniqueKeys.find((key) =>
          errorString.includes(key.key),
        );
        if (errorKey) {
          return new HttpException(
            `${errorKey.name} already taken by another user`,
            HttpStatus.BAD_REQUEST,
          );
        } else {
          return new HttpException(
            'Duplicate input found',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        return new HttpException(
          'Failed to create User for invalid inputs',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async createUserRoleSpecificDetails(
    newUser: User,
    dto: RegisterPatientOrCaretakerDto | CreateUserDto,
  ): Promise<void> {
    try {
      switch (dto.role) {
        case Role.DOCTOR:
          await this.userService.createDoctorDetails(newUser, dto);
          break;
        case Role.PATIENT:
          await this.userService.createPatientDetails(newUser, dto);
          break;
        case Role.CARETAKER:
          await this.userService.createCaretakerDetails(newUser, dto);
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  async validateUserLogin(username: string, pass: string): Promise<any> {
    const user = await this.userModelService.findUserLoginInfoByUsername(
      username,
    );
    if (user) {
      // Check for account Block for password brute force protection
      if (
        user.isBlocked &&
        user.blockedAt &&
        addDays(PASSWORD_BRUTE_lOCK_DAYS, user.blockedAt) > new Date()
      ) {
        throw new ForbiddenException(
          'Your account has been locked. Please contact Respiree Staff for more info',
        );
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        if (user.loginFailedCount)
          await this.userModelService.resetBlockedUserAccount(user.id);
        return await this.userModelService.findOne(user.id);
      } else {
        let isBlocked = false;
        if (user.loginFailedCount + 1 >= LOGIN_FAILED_ATTEMPTS_TO_BLOCK)
          isBlocked = true;
        await this.userModelService.updateLoginFailure(user.id, isBlocked);
        if (isBlocked) {
          this.sendAccountBlockNotification(user);
          throw new ForbiddenException(
            'Your account has been locked for multiple failure attempts',
          );
        }
      }
    }
    return null;
  }

  validatePassword(password: string): void {
    if (!validatePasswordRegex(password)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, one uppercase,one lowercase,one number and one special case character with no spaces',
      );
    }
  }

  async login(user: User): Promise<any> {
    if (
      (user.isClinicalTrialUser || user.isClientPatient) &&
      !user.isEmailVerified
    ) {
      const temperoryToken = await this.updateAndGetUserTemperoryToken(user);
      return {
        userData: {
          username: user.username,
          email: user.email,
          isClinicalTrialUser: user.isClinicalTrialUser,
          isClientPatient: user.isClientPatient,
        },
        access_token: null,
        temperory_token: temperoryToken,
      };
    }
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    return {
      userData: user,
      temperory_token: null,
      access_token: this.jwtService.signToken(payload),
    };
  }

  async setLoginRefreshToken(res: Response, user: User): Promise<void> {
    const refreshToken = this.jwtService.signRefreshToken({
      username: user.username,
    });
    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 2 * 60 * 60 * 1000, // 2 days
    });
  }

  async deleteLoginRefreshToken(res: Response): Promise<void> {
    res.clearCookie(REFRESH_TOKEN_KEY, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 2 * 60 * 60 * 1000, // 2 days
    });
  }

  async verifyJwtToken(bearerToken: string) {
    return this.jwtService.verifyBearerToken(bearerToken);
  }

  async verifyRefreshJwtToken(token: string) {
    return this.jwtService.verifyRefreshToken(token);
  }

  async verifyRegistrationCode(code: string): Promise<boolean> {
    const verficationCode = await this.constantsModelService.findOneByKey(
      CONSTANT_KEYS.REGISTRATION_CODE,
    );
    if (verficationCode.value === code) {
      return true;
    } else {
      return false;
    }
  }

  async updateAndGetUserTemperoryToken(user: User): Promise<string> {
    try {
      const tempToken = generateTokenString();
      await this.userModelService.updateUserTemperoryToken(user.id, tempToken);
      return tempToken;
    } catch (error) {
      throw error;
    }
  }

  async createAndUpdateChatId(user: User): Promise<any> {
    const creatChatUser = {
      login: user.username,
      password: user.id,
      fullName: user.firstName
        ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${
            user.lastName
          }`
        : null,
      role: user.role,
    };
    try {
      const connectyResponse = await this.chatService.createUser(creatChatUser);
      this.logService.logInfo('User created for Connectycube chat', {
        user: connectyResponse.data.user,
      });
      // const connectyResponse = await this.chatService.loginUserUsingCIdP({
      //   token: (await this.login(user)).access_token,
      // });
      this.userModelService.update(user.id, {
        chatId: connectyResponse.data.user.id,
      });
    } catch (error) {
      this.logService.logError(
        `Error creating and updating conective Cube Chat Id for user ${user.username} , id: ${user.id}`,
        { userData: creatChatUser, error },
      );
      throw error;
    }
  }

  async validateSensorOnPatientRegisteration(
    macId: string,
    organizationId: string,
  ): Promise<Sensor> {
    try {
      const sensor = await this.sensorModelService
        .validateAndGetSensorByMacId(macId, organizationId)
        .catch(() => {
          throw new BadRequestException(
            'No sensor with this MacId is registered with the organization',
          );
        });
      if (!sensor.isAvailable && sensor.patientId) {
        throw new BadRequestException(
          'Sensor is not available. Please contact admin',
        );
      }
      return sensor;
    } catch (error) {
      throw error;
    }
  }

  async sendPatientRegistrationToThirdParty(
    baseUrl: string,
    credentials: ISendThirPartyPatientCredentials,
  ) {
    try {
      await this.thirdPartyService.sendPatientCredentials(baseUrl, credentials);
    } catch (error) {
      throw error;
    }
  }

  async validateOrganziationById(organizationId: string) {
    try {
      const organization = await this.organizationModelService.findOneById(
        organizationId,
      );
      if (!organization) {
        throw new BadRequestException('Invalid organziation');
      }
      if (!organization.organizationSettings) {
        organization.organizationSettings = await this.organizationSettingsModelService.create(
          organization,
        );
      }
      return organization;
    } catch (error) {
      throw error;
    }
  }

  getPasswordForClinicalTrial(organization: Organization): string {
    try {
      if (
        organization.organizationSettings &&
        organization.organizationSettings.accessCode
      ) {
        return `${organization.organizationSettings.accessCode}123`;
      } else {
        return `${organization.name.replace(/ /g, '')}123`;
      }
    } catch (error) {
      throw error;
    }
  }

  async sendAccountBlockNotification(user: User) {
    try {
      const token = generateTokenString();
      await this.userModelService.updateUserBlockToken(user.id, token);
      const unlockLink = `${this.configService.get(
        'WEB_APP_URL',
      )}${USER_UNLOCK_LINK}?id=${token}`;
      const passwordChangeLink = `${this.configService.get(
        'WEB_APP_URL',
      )}${USER_CHNAGE_PASSWORD_LINK}?id=${token}`;
      // send Email notification
      this.emailService.sendEmail({
        to: [user.email],
        subject: 'Your Respiree account has been locked',
        templateName: 'account_suspended.ejs',
        context: {
          name: user.firstName,
          unlockLink: unlockLink,
          passwordChangeLink: passwordChangeLink,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async sendEmailVerification(user: User) {
    try {
      if (user.email) {
        const token = generateTokenString();
        await this.userModelService.updateUserEmailVerificationToken(
          user.id,
          token,
        );
        const verifyLink = `${this.configService.get(
          'WEB_APP_URL',
        )}${USER_EMAIL_VERIFICATION_LINK}?id=${token}&role=${
          user.role
        }&tAndC=${true}&updatePass=${
          user.isClinicalTrialUser || user.isClientPatient
        }`;
        // send Email notification
        this.emailService.sendEmail({
          to: [user.email],
          subject:
            'Accept the Terms and Conditions to finish signing up for Respiree',
          templateName: 'verify_email.ejs',
          context: {
            username: user.firstName ? user.firstName : user.username,
            verifyLink: verifyLink,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyUserAccountResetToken(token: string) {
    try {
      const user = await this.userModelService.getUserByAccountResetToken(
        token,
      );
      if (!user) {
        throw new BadRequestException('Invalid verification code');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async validateEmailVerificationToken(token: string): Promise<User> {
    try {
      const user = await this.userModelService.getUserByEmailVerificationToken(
        token,
      );
      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async checkCreateUserVerification(
    organizationId: string,
    code: string,
  ): Promise<boolean> {
    try {
      const organziation = await this.validateOrganziationById(organizationId);
      if (organziation.organizationSettings.accessCode !== code) {
        throw new ForbiddenException(
          'Incorrect verificaion code for registration',
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
