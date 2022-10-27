import { Inject, Injectable } from '@nestjs/common';
import { PUSH_NOTIFICATION_CLIENT } from '../../config/constants';
import { INotificationPayload } from './interfaces';
import { convertObjectValueToString } from '../../common/utils/helpers';
import { LogService } from '../logger/logger.service';
import { isEmpty } from 'lodash';

@Injectable()
export class PushNotificationService {
  constructor(
    private logService: LogService,
    @Inject(PUSH_NOTIFICATION_CLIENT) private readonly pushClient,
  ) {}

  async sendToDevice(
    token: string,
    payload: INotificationPayload,
  ): Promise<void> {
    const body = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: isEmpty(payload.data)
        ? {}
        : convertObjectValueToString(payload.data),
    };
    const response = await this.pushClient
      .messaging()
      .sendToDevice(token, body)
      .catch((err) => {
        throw err;
      });
    return response;
  }

  async sendMultiplePush(
    tokens: string[],
    payload: INotificationPayload,
  ): Promise<void> {
    try {
      const body = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: convertObjectValueToString(payload.data),
        tokens: tokens,
      };
      return await this.pushClient
        .messaging()
        .sendMulticast(body)
        .catch((err) => {
          this.logService.logError('Failed to send push notification', err);
          throw err;
        });
    } catch (error) {
      this.logService.logError('Failed at sendMultiplePush', error);
      throw error;
    }
  }
}
