import { JWTServiceModule } from './../../../services/jwt-service/jwt-service.module';
import { EmailModule } from './../../../services/email/email.module';
import { OrganizationSettingsModelModule } from './../../../models/organization-settings/organization-settings.model.module';
import { SensorModelModule } from './../../../models/sensor/sensor.model.module';
import { ThirdPartyModule } from './../../../services/third-party-services/third-party.module';
import { SensorModule } from './../sensor/sensor.module';
import { PatientInfoModelModule } from './../../../models/patient_info/patient_info.model.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from '../../../common/strategies/local.strategy';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '../../../services/chat/chat.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';
import { UserAppDeviceModelModule } from '../../../models/user_app_device/user_app_device.model.module';
import { ConstantsModule } from '../../../models/constants/constants.model.module';

@Module({
  imports: [
    UserModelModule,
    PatientInfoModelModule,
    UserAppDeviceModelModule,
    SensorModelModule,
    UserModule,
    forwardRef(() => SensorModule),
    ThirdPartyModule,
    PassportModule,
    ConfigModule,
    ChatModule,
    OrganizationModelModule,
    OrganizationSettingsModelModule,
    ConstantsModule,
    EmailModule,
    JWTServiceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
