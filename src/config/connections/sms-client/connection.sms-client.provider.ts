import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { SMS_CLIENT } from '../../constants';

export const AWS_SNS_Connection = {
  provide: SMS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    const snsClient = new AWS.SNS({
      accessKeyId: configService.get('AWS_SNS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SNS_SECRET_ACCESS_KEY'),
      region: configService.get('AWS_SNS_REGION'),
    });
    snsClient.setSMSAttributes({
      attributes: {
        DefaultSenderID: configService.get('AWS_SNS_SENDER'),
      },
    });
    return snsClient;
  },
  inject: [ConfigService],
};
