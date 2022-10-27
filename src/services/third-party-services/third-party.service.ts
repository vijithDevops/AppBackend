import { Injectable, HttpService } from '@nestjs/common';
import { SEND_PATIENT_CREDENTIALS_PATH } from 'src/config/constants';
import { LogService } from '../logger/logger.service';
import { ISendPatientCredentials } from './interfaces';

@Injectable()
export class ThirdPartyService {
  constructor(
    private logService: LogService,
    private readonly httpService: HttpService,
  ) {}

  async sendPatientCredentials(
    baseUrl: string,
    credentials: ISendPatientCredentials,
  ) {
    try {
      const response = await this.httpService
        .post(baseUrl + SEND_PATIENT_CREDENTIALS_PATH, credentials)
        .toPromise();
      this.logService.logInfo(
        `Success sending Login credential to ${baseUrl}`,
        {
          credentials,
          responseCode: response.status
            ? response.status
            : 'Status not availble',
        },
      );
    } catch (err) {
      this.logService.logError('Failed to send patient credentials', { err });
      throw err;
    }
  }
}
