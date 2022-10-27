import { Module } from '@nestjs/common';
import { PatientAlertService } from './patient-alert.service';
import { NotificationServiceModule } from '../notification/notification.module';
import { PatientAlertSettingsModelModule } from 'src/models/patient_alert_settings/patient_alert_settings.model.module';
import { BreatingExercisePrescriptionModelModule } from '../../models/breathing_exercise_prescription/breathing_exercise_prescription.model.module';
import { MedicationPrescriptionModelModule } from '../../models/medication_prescription/medication_prescription.model.module';
import { PatientBreathingInputModelModule } from '../../models/patient_breathing_input/patient_breathing_input.model.module';
import { PatientMedicationInputModelModule } from '../../models/patient_medication_input/patient_medication_input.model.module';
import { PatientHealthInputModelModule } from '../../models/patient_health_inputs/patient_health_inputs.model.module';
import { PatientSymptomsInputModelModule } from '../../models/patient_symptoms_input/patient_symptoms_input.model.module';
import { PatientSupervisionMappingModelModule } from '../../models/patient_supervision_mapping/patient_supervision_mapping.model.module';

@Module({
  imports: [
    NotificationServiceModule,
    PatientSupervisionMappingModelModule,
    PatientAlertSettingsModelModule,
    BreatingExercisePrescriptionModelModule,
    MedicationPrescriptionModelModule,
    PatientBreathingInputModelModule,
    PatientMedicationInputModelModule,
    PatientHealthInputModelModule,
    PatientSymptomsInputModelModule,
  ],
  providers: [PatientAlertService],
  exports: [PatientAlertService],
})
export class PatientAlertModule {}
