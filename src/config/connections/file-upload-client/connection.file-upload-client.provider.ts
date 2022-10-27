import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { FILE_UPLOAD_CLIENT } from '../../constants';

export const AWS_S3_Connection = {
  provide: FILE_UPLOAD_CLIENT,
  useFactory: async (configService: ConfigService) => {
    return new S3({
      accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      region: configService.get('AWS_S3_REGION'),
      correctClockSkew: true,
    });
  },
  inject: [ConfigService],
};
