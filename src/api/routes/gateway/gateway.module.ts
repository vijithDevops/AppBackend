import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { UserModelModule } from '../../../models/user/user.model.module';
import { GatewayModelModule } from '../../../models/gateway/gateway.model.module';
import { SensorModelModule } from '../../../models/sensor/sensor.model.module';
import { PatientInfoModelModule } from '../../../models/patient_info/patient_info.model.module';
import { SocketServiceModule } from '../../../services/socket-service/socket-service.module';
import { MQTTServiceModule } from '../../../services/mqtt-service/mqtt-service.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';
import { SensorModule } from '../sensor/sensor.module';

@Module({
  imports: [
    forwardRef(() => SensorModule),
    UserModelModule,
    PatientInfoModelModule,
    GatewayModelModule,
    SensorModelModule,
    ConfigModule,
    SocketServiceModule,
    MQTTServiceModule,
    UserModelModule,
    OrganizationModelModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
