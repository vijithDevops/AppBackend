import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAlertSettingsModelService } from './patient_alert_settings.model.service';
import { PatientAlertSettings } from './entity/patient_alert_settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientAlertSettings])],
  providers: [PatientAlertSettingsModelService],
  exports: [PatientAlertSettingsModelService],
})
export class PatientAlertSettingsModelModule {}
