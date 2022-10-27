import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../logger/logger.service';
import { IGetTrendsParams, IUpdatePatientListCache } from './interfaces';

@Injectable()
export class DataProcessingServerService {
  constructor(
    private logService: LogService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTrends(
    queryParams: IGetTrendsParams,
    headers: any = {},
  ): Promise<{ [key: string]: number[] }> {
    try {
      const response = await this.httpService
        .get('/query/trends', { params: queryParams, headers })
        .toPromise();
      return response.data.response.metrics;
    } catch (err) {
      this.logService.logError(
        'Failed at get trends from data processign server',
        { err },
      );
      throw err;
    }
  }

  async updatePatientListCache(
    body: IUpdatePatientListCache,
    headers: any = {},
  ) {
    try {
      const reqHeader = {
        ...headers,
        'server-auth-key': this.configService.get(
          'DATA_PROCESSING_SERVER_AUTH_KEY',
        ),
      };
      const response = await this.httpService
        .post('/update_cache', body, { headers: reqHeader })
        .toPromise();
      return response;
    } catch (err) {
      this.logService.logError(
        'Failed at update cache on data processign server',
        { body, err },
      );
      throw err;
    }
  }
}
