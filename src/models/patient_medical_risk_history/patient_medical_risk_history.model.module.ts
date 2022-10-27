import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientMedicalRiskHistoryModelService } from './patient_medical_risk_history.model.service';
import { PatientMedicalRiskHistory } from './entity/patient_medical_risk_history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientMedicalRiskHistory])],
  providers: [PatientMedicalRiskHistoryModelService],
  exports: [PatientMedicalRiskHistoryModelService],
})
export class PatientMedicalRiskHistoryModelModule {}
