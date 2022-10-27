import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientSymptomsInputModelService } from './patient_symptoms_input.model.service';
import { PatientSymptomsInput } from './entity/patient_symptoms_input.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientSymptomsInput])],
  providers: [PatientSymptomsInputModelService],
  exports: [PatientSymptomsInputModelService],
})
export class PatientSymptomsInputModelModule {}
