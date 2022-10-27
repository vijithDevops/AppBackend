import { Module } from '@nestjs/common';
import { DataServerService } from './data-server.service';
import { DataServerController } from './data-server.controller';
import { PatientInfoModelModule } from '../../../models/patient_info/patient_info.model.module';
import { PatientAlertSettingsModelModule } from '../../../models/patient_alert_settings/patient_alert_settings.model.module';
import { CalendarModule } from '../calendar/calendar.module';
import { PatientAlertModule } from '../../../services/patient-alerts/patient-alert.module';
import { GatewayModelModule } from '../../../models/gateway/gateway.model.module';
import { SensorModelModule } from '../../../models/sensor/sensor.model.module';

@Module({
  imports: [
    PatientAlertSettingsModelModule,
    PatientInfoModelModule,
    CalendarModule,
    PatientAlertModule,
    GatewayModelModule,
    SensorModelModule,
  ],
  controllers: [DataServerController],
  providers: [DataServerService],
})
export class DataServerModule {}
