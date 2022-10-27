import { ForgotPasswordService } from './forgot-password.service';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  RequestForgorPasswordDto,
  VerifyOtpDto,
  UpdatePasswordDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SmsService } from '../../../services/sms/sms.service';
import {
  FORGOT_PASSWORD_OTP_EXPIRES_IN,
  FORGOT_PASSWORD_MESSAGE_BODY,
  UPDATE_PASSWORD_AFTER_OTP_VERIFICATION_EXPIRES_IN,
} from '../../../config/constants';
import { PasswordChangeRequestModelService } from '../../../models/password_change_request/password_change_request.model.service';
import { UserModelService } from '../../../models/user/user.model.service';
import { validatePasswordRegex } from 'src/common/utils/validators';

@Controller('forgot-password')
@ApiTags('Forgot-password')
export class ForgotPasswordController {
  constructor(
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly passwordChangeRequestModelService: PasswordChangeRequestModelService,
    private readonly userModelService: UserModelService,
    private readonly smsService: SmsService,
  ) {}

  @Post('/')
  @ApiBody({
    type: RequestForgorPasswordDto,
    description:
      'Request for user password change. User will receive an OTP in the registered mobile number',
  })
  async requestForgotPassword(
    @Body() requestForgotPassword: RequestForgorPasswordDto,
  ) {
    try {
      const user = await this.userModelService.findOneByUsername(
        requestForgotPassword.username,
      );
      if (!user) {
        throw new HttpException('Invalid username', HttpStatus.BAD_REQUEST);
      }
      const passwordChangeRequest = await this.forgotPasswordService.createPasswordchangeRequest(
        user.id,
      );
      await this.smsService.sendSms({
        message: FORGOT_PASSWORD_MESSAGE_BODY.replace(
          '{otp}',
          `${passwordChangeRequest.otp}`,
        ),
        phoneNumber: user.phoneNumber,
      });
      return {
        requestId: passwordChangeRequest.id,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/verify-otp')
  @ApiBody({
    type: VerifyOtpDto,
    description: 'Verify OTP for forgot password',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const currentTime = new Date();
      const passwordChangeRequest = await this.passwordChangeRequestModelService.findOne(
        verifyOtpDto.requestId,
      );
      if (!passwordChangeRequest) {
        throw new HttpException(
          'Invalid request for forgot password',
          HttpStatus.BAD_REQUEST,
        );
      }
      const otpExpiryAt =
        new Date(passwordChangeRequest.otpGeneratedAt).getTime() +
        FORGOT_PASSWORD_OTP_EXPIRES_IN;
      if (
        currentTime.getTime() <= otpExpiryAt &&
        !passwordChangeRequest.isOtpVerified &&
        !passwordChangeRequest.isExpired
      ) {
        if (passwordChangeRequest.otp === verifyOtpDto.otp) {
          await this.passwordChangeRequestModelService.updateVerifyOtp(
            passwordChangeRequest.id,
            currentTime,
          );
          return {
            message: 'OTP verified successfully',
            requestId: passwordChangeRequest.id,
          };
        } else {
          throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException('Request expired', HttpStatus.NOT_ACCEPTABLE);
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('/update-password')
  @ApiBody({
    type: UpdatePasswordDto,
    description:
      'Update user with new password after sucessfully verifying OTP',
  })
  async updateNewPassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    try {
      if (!validatePasswordRegex(updatePasswordDto.newPassword)) {
        throw new BadRequestException(
          'Password must contain at least 8 characters, one uppercase,one lowercase,one number and one special case character with no spaces',
        );
      }
      const currentTime = new Date();
      const passwordChangeRequest = await this.passwordChangeRequestModelService.findOne(
        updatePasswordDto.requestId,
      );
      if (!passwordChangeRequest) {
        throw new HttpException(
          'Invalid request for password update',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (passwordChangeRequest.isOtpVerified) {
        const passwordUpdatepdateExpiresAt =
          new Date(passwordChangeRequest.otpVerifiedAt).getTime() +
          UPDATE_PASSWORD_AFTER_OTP_VERIFICATION_EXPIRES_IN;
        if (
          currentTime.getTime() <= passwordUpdatepdateExpiresAt &&
          !passwordChangeRequest.isExpired
        ) {
          const user = await this.userModelService.findUserPasswordById(
            passwordChangeRequest.userId,
          );
          if (
            await bcrypt.compare(updatePasswordDto.newPassword, user.password)
          ) {
            throw new BadRequestException(
              'New password cannot be the same as the previous password',
            );
          }
          //update user password and expire OTP request
          await Promise.all([
            this.userModelService.updateUserPassword(
              passwordChangeRequest.userId,
              updatePasswordDto.newPassword,
            ),
            this.passwordChangeRequestModelService.expirePasswordChangeRequest(
              passwordChangeRequest.id,
            ),
          ]);
          return {
            status: 200,
            message: 'Password changed successfully',
          };
        } else {
          throw new HttpException('Request expired', HttpStatus.NOT_ACCEPTABLE);
        }
      } else {
        throw new HttpException('OTP not verified', HttpStatus.NOT_ACCEPTABLE);
      }
    } catch (error) {
      throw error;
    }
  }
}
