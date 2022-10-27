import { Module } from '@nestjs/common';
import { MedicationPrescriptionController } from './medication-prescription.controller';
import { MedicationPrescriptionService } from './medication-prescription.service';
import { CalendarModelModule } from '../../../models/calendar/calendar.model.module';
import { MedicationPrescriptionModelModule } from '../../../models/medication_prescription/medication_prescription.model.module';
import { PatientMedicationInputModelModule } from '../../../models/patient_medication_input/patient_medication_input.model.module';
import { UserModelModule } from 'src/models/user/user.model.module';

@Module({
  imports: [
    MedicationPrescriptionModelModule,
    PatientMedicationInputModelModule,
    CalendarModelModule,
    UserModelModule,
  ],
  controllers: [MedicationPrescriptionController],
  providers: [MedicationPrescriptionService],
  exports: [MedicationPrescriptionService],
})
export class MedicationPrescriptionModule {}
