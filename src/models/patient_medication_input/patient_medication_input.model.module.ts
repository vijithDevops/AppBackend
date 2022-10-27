import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientMedicationInputModelService } from './patient_medication_input.model.service';
import { PatientMedicationInput } from './entity/patient_medication_input.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientMedicationInput])],
  providers: [PatientMedicationInputModelService],
  exports: [PatientMedicationInputModelService],
})
export class PatientMedicationInputModelModule {}
