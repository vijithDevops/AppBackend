import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AWS_SNS_Connection } from './connection.sms-client.provider';

@Module({
  imports: [ConfigModule],
  providers: [AWS_SNS_Connection],
  exports: [AWS_SNS_Connection],
})
export class SMSConnectionModule {}
