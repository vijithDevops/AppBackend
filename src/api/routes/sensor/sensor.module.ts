import { forwardRef, Module } from '@nestjs/common';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { SensorModelModule } from '../../../models/sensor/sensor.model.module';
import { PatientInfoModelModule } from '../../../models/patient_info/patient_info.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { SocketServiceModule } from '../../../services/socket-service/socket-service.module';
import { GatewayModelModule } from '../../../models/gateway/gateway.model.module';
import { GatewayModule } from '../gateway/gateway.module';
import { OrganizationModelModule } from '../../../models/organization/organization.model.module';

@Module({
  imports: [
    SensorModelModule,
    UserModelModule,
    PatientInfoModelModule,
    SocketServiceModule,
    GatewayModelModule,
    forwardRef(() => GatewayModule),
    OrganizationModelModule,
  ],
  controllers: [SensorController],
  providers: [SensorService],
  exports: [SensorService],
})
export class SensorModule {}
