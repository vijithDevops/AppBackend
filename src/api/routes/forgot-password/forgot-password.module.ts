import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { SmsModule } from '../../../services/sms/sms.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { PasswordChangeRequestModelModule } from '../../../models/password_change_request/password_change_request.model.module';

@Module({
  imports: [PasswordChangeRequestModelModule, UserModelModule, SmsModule],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
