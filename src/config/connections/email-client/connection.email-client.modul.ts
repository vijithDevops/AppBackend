import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { SES } from 'aws-sdk';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          SES: new SES({
            accessKeyId: configService.get('AWS_SES_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SES_SECRET_ACCESS_KEY'),
            region: configService.get('AWS_SES_REGION'),
          }),
        },
        defaults: {
          from: `Respiree <${configService.get('EMAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../../../../assets/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class EmailConnectionModule {}
