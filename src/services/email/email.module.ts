import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConnectionModule } from '../../config/connections/email-client/connection.email-client.modul';

@Module({
  imports: [EmailConnectionModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
