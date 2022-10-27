import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationPrescriptionModelService } from './medication_prescription.model.service';
import { MedicationPrescription } from './entity/medication_prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationPrescription])],
  providers: [MedicationPrescriptionModelService],
  exports: [MedicationPrescriptionModelService],
})
export class MedicationPrescriptionModelModule {}
