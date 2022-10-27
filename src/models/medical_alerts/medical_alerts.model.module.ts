import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalAlertNotificationSettings } from './entity/medical_alert_notification_settings.entity';
import { MedicalAlertSettings } from './entity/medical_alert_settings.entity';
import { PatientMedicalRisk } from './entity/patient_medical_risk.entity';
import { PatientVitalRisk } from './entity/patient_vital_risk.entity';
import { MedicalAlertModelService } from './medical_alerts.model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalAlertSettings,
      MedicalAlertNotificationSettings,
      PatientMedicalRisk,
      PatientVitalRisk,
    ]),
  ],
  providers: [MedicalAlertModelService],
  exports: [MedicalAlertModelService],
})
export class MedicalAlertModelModule {}
