import { Module } from '@nestjs/common';
import { SocketService } from './socket-service.service';
import { SocketModule } from '../../api/socket/socket.module';
import { GatewayModelModule } from '../../models/gateway/gateway.model.module';
import { SensorModelModule } from '../../models/sensor/sensor.model.module';
import { PatientInfoModelModule } from '../../models/patient_info/patient_info.model.module';
import { UserModelModule } from '../../models/user/user.model.module';

@Module({
  imports: [
    SocketModule,
    GatewayModelModule,
    SensorModelModule,
    PatientInfoModelModule,
    UserModelModule,
  ],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketServiceModule {}
