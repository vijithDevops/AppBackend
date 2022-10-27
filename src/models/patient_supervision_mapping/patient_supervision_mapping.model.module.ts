import { Module } from '@nestjs/common';
import { PatientSupervisionMappingModelService } from './patient_supervision_mapping.model.service';
import { PatientSupervisionMapping } from './entity/patient_supervision_mapping.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PatientSupervisionMapping])],
  providers: [PatientSupervisionMappingModelService],
  exports: [PatientSupervisionMappingModelService],
})
export class PatientSupervisionMappingModelModule {}
