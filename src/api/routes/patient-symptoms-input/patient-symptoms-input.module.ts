import { Module } from '@nestjs/common';
import { PatientSymptomsInputController } from './patient-symptoms-input.controller';
import { PatientSymptomsInputService } from './patient-symptoms-input.service';
import { PatientSymptomsInputModelModule } from '../../../models/patient_symptoms_input/patient_symptoms_input.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { PatientAlertSettingsModelModule } from '../../../models/patient_alert_settings/patient_alert_settings.model.module';
import { PatientAlertModule } from '../../../services/patient-alerts/patient-alert.module';
import { UserModelModule } from '../../../models/user/user.model.module';

@Module({
  imports: [
    PatientSymptomsInputModelModule,
    CalendarModelModule,
    PatientAlertSettingsModelModule,
    PatientAlertModule,
    UserModelModule,
  ],
  controllers: [PatientSymptomsInputController],
  providers: [PatientSymptomsInputService],
  exports: [PatientSymptomsInputService],
})
export class PatientSymptomsInputModule {}
