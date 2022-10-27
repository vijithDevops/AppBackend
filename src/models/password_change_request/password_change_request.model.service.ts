import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogService } from 'src/services/logger/logger.service';
import { Repository } from 'typeorm';
import { PasswordChangeRequest } from './entity/password_change_request.entity';
import { ICreatePasswordChangeRequest } from './interfaces';

@Injectable()
export class PasswordChangeRequestModelService {
  constructor(
    private logService: LogService,
    @InjectRepository(PasswordChangeRequest)
    private passwordChangeRequestRepository: Repository<PasswordChangeRequest>,
  ) {}

  async create(createObject: ICreatePasswordChangeRequest) {
    return await this.passwordChangeRequestRepository.save(createObject);
  }

  async save(object: PasswordChangeRequest) {
    return await this.passwordChangeRequestRepository.save(object);
  }

  async findOne(id: string) {
    return await this.passwordChangeRequestRepository.findOne({ id });
  }

  async findOneByUserId(id: string) {
    return await this.passwordChangeRequestRepository.findOne({ userId: id });
  }

  async updateVerifyOtp(id: string, verifiedAt: Date) {
    return await this.passwordChangeRequestRepository
      .save({
        id,
        isOtpVerified: true,
        otpVerifiedAt: verifiedAt,
      })
      .catch((err) => {
        this.logService.logError(`OTP verify update failed ${id}`, err);
        throw err;
      });
  }

  async expirePasswordChangeRequest(id: string) {
    return await this.passwordChangeRequestRepository
      .save({
        id,
        isExpired: true,
      })
      .catch((err) => {
        this.logService.logError(
          `failed to update forgot password expiry ${id}`,
          err,
        );
        throw err;
      });
  }
}
