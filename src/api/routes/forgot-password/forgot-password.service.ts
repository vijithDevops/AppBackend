import { Injectable } from '@nestjs/common';
import { randomNumber } from '../../../common/utils/helpers';
import { PasswordChangeRequest } from '../../../models/password_change_request/entity/password_change_request.entity';
import { PasswordChangeRequestModelService } from '../../../models/password_change_request/password_change_request.model.service';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private passwordChangeRequestModelService: PasswordChangeRequestModelService,
  ) {}

  async createPasswordchangeRequest(
    userId: string,
  ): Promise<PasswordChangeRequest> {
    const passwordChangeRequest = {
      userId: userId,
      otp: this.generateOtp(),
      otpGeneratedAt: new Date(),
      isOtpVerified: false,
      otpVerifiedAt: null,
      isExpired: false,
    };
    const passwordChangeRequestObject = await this.passwordChangeRequestModelService.findOneByUserId(
      userId,
    );
    if (!passwordChangeRequestObject) {
      return await this.passwordChangeRequestModelService.create(
        passwordChangeRequest,
      );
    } else {
      passwordChangeRequestObject.generatedCount++;
      return await this.passwordChangeRequestModelService.create({
        ...passwordChangeRequestObject,
        ...passwordChangeRequest,
      });
    }
  }

  generateOtp(): number {
    return randomNumber();
  }
}
