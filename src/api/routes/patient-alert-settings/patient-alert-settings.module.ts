import { Module } from '@nestjs/common';
import { PatientAlertSettingsController } from './patient-alert-settings.controller';
import { PatientAlertSettingsService } from './patient-alert-settings.service';
import { PatientAlertSettingsModelModule } from '../../../models/patient_alert_settings/patient_alert_settings.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';
import { MedicalAlertsModule } from '../medical-alerts/medical-alerts.module';
import { VitalSignsModelModule } from '../../../models/vital_signs/vital_signs.model.module';

@Module({
  imports: [
    UserModelModule,
    PatientAlertSettingsModelModule,
    MedicalAlertsModule,
    VitalSignsModelModule,
  ],
  controllers: [PatientAlertSettingsController],
  providers: [PatientAlertSettingsService],
  exports: [PatientAlertSettingsService],
})
export class PatientAlertSettingsModule {}
