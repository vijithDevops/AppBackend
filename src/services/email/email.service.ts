import { Injectable } from '@nestjs/common';
// import { SES } from 'aws-sdk';
// import { EMAIL_CLIENT } from '../../config/constants';
import { ISendEmail } from './interfaces';
import { LogService } from '../logger/logger.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as ejs from 'ejs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

const templatePath = join(__dirname, '../../../../assets/templates');

@Injectable()
export class EmailService {
  constructor(
    // @Inject(EMAIL_CLIENT) private readonly client: SES,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
    private logService: LogService,
  ) {}

  /**
   * To send email with AWS SES
   *
   * @param {ISendEmail} params
   * @returns {Promise<void>}
   * @memberof EmailService
   */
  async sendEmail(params: ISendEmail): Promise<void> {
    try {
      const htmlData: string = await ejs.renderFile(
        `${templatePath}/${params.templateName}`,
        params.context,
      );
      const from = params.from
        ? params.from
        : this.configService.get('EMAIL_FROM');
      const sendParams = {
        from: from,
        to: params.to,
        replyTo: from,
        subject: params.subject,
        html: htmlData,
        cc: params.cc,
      };
      const mailResponse = await this.mailerService.sendMail(sendParams);
      this.logService.logInfo('Success sending Email : ', {
        mailResponse,
        params,
      });
    } catch (error) {
      this.logService.logInfo('Failed to send Email : ', { error, params });
      throw error;
    }
  }
}
