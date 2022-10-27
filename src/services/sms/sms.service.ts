import { Inject, Injectable } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import { SMS_CLIENT } from '../../config/constants';
import { ISendSmsParams } from './interfaces';

@Injectable()
export class SmsService {
  constructor(@Inject(SMS_CLIENT) private readonly smsClient: SNS) {}

  /**
   * To send SMS with AWS SNS
   *
   * @param {ISendSmsParams} params
   * @returns {Promise<void>}
   * @memberof SmsService
   */
  async sendSms(params: ISendSmsParams): Promise<void> {
    (async () => {
      return await this.smsClient
        .publish({
          Message: params.message,
          PhoneNumber: params.phoneNumber,
        })
        .promise()
        .catch((err) => {
          throw new Error(err.message);
        });
    })();
  }
}
