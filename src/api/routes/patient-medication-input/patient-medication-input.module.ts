import { Module } from '@nestjs/common';
import { PatientMedicationInputController } from './patient-medication-input.controller';
import { PatientMedicationInputService } from './patient-medication-input.service';
import { PatientMedicationInputModelModule } from '../../../models/patient_medication_input/patient_medication_input.model.module';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { MedicationPrescriptionModelModule } from '../../../models/medication_prescription/medication_prescription.model.module';
import { UserModelModule } from '../../../models/user/user.model.module';

@Module({
  imports: [
    MedicationPrescriptionModelModule,
    PatientMedicationInputModelModule,
    CalendarModelModule,
    UserModelModule,
  ],
  controllers: [PatientMedicationInputController],
  providers: [PatientMedicationInputService],
  exports: [PatientMedicationInputService],
})
export class PatientMedicationInputModule {}
