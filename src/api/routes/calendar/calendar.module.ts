import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { UserModelModule } from '../../../models/user/user.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { BreatingExercisePrescriptionModelModule } from '../../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.module';
import { MedicationPrescriptionModelModule } from '../../../models/medication_prescription/medication_prescription.model.module';
import { PatientAlertSettingsModelModule } from '../../../models/patient_alert_settings/patient_alert_settings.model.module';
import { PatientAlertModule } from '../../../services/patient-alerts/patient-alert.module';

@Module({
  imports: [
    BreatingExercisePrescriptionModelModule,
    MedicationPrescriptionModelModule,
    UserModelModule,
    CalendarModelModule,
    PatientAlertSettingsModelModule,
    PatientAlertModule,
  ],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
