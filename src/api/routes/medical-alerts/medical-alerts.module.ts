import { Module } from '@nestjs/common';
import { JWTServiceModule } from './../../../services/jwt-service/jwt-service.module';
import { MedicalAlertsService } from './medical-alerts.service';
import { MedicalAlertsController } from './medical-alerts.controller';
import { VitalSignsModelModule } from 'src/models/vital_signs/vital_signs.model.module';
import { MedicalAlertModelModule } from 'src/models/medical_alerts/medical_alerts.model.module';
import { NotificationEventMasterModelModule } from '../../../models/notification_event_master/notification_event_master.model.module';
import { EventSchedulerModule } from '../../../services/event-scheduler/event-scheduler.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { DataProcessingServerModule } from '../../../services/data-processing-server/data-processing-server.module';
import { NotificationServiceModule } from 'src/services/notification/notification.module';
import { PatientMedicalRiskHistoryModelModule } from 'src/models/patient_medical_risk_history/patient_medical_risk_history.model.module';
import { PatientVitalRiskHistoryModelModule } from 'src/models/patient_vital_risk_history/patient_vital_risk_history.model.module';

@Module({
  imports: [
    MedicalAlertModelModule,
    VitalSignsModelModule,
    NotificationEventMasterModelModule,
    EventSchedulerModule,
    UserModelModule,
    DataProcessingServerModule,
    NotificationServiceModule,
    PatientMedicalRiskHistoryModelModule,
    PatientVitalRiskHistoryModelModule,
    JWTServiceModule,
  ],
  controllers: [MedicalAlertsController],
  providers: [MedicalAlertsService],
  exports: [MedicalAlertsService],
})
export class MedicalAlertsModule {}
