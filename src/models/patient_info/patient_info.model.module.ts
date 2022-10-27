import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientInfoModelService } from './patient_info.model.service';
import { PatientInfo } from './entity/patient_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientInfo])],
  providers: [PatientInfoModelService],
  exports: [PatientInfoModelService],
})
export class PatientInfoModelModule {}
