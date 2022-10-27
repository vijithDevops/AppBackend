import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SMSConnectionModule } from '../../config/connections/sms-client/connection.sms-client.module';

@Module({
  imports: [SMSConnectionModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
