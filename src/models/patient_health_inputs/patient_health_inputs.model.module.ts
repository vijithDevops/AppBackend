import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientHealthInputModelService } from './patient_health_inputs.model.service';
import { PatientHealthInputs } from './entity/patient_health_inputs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientHealthInputs])],
  providers: [PatientHealthInputModelService],
  exports: [PatientHealthInputModelService],
})
export class PatientHealthInputModelModule {}
