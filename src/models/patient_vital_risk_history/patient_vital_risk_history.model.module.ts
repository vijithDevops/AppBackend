import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientVitalRiskHistoryModelService } from './patient_vital_risk_history.model.service';
import { PatientVitalRiskHistory } from './entity/patient_vital_risk_history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientVitalRiskHistory])],
  providers: [PatientVitalRiskHistoryModelService],
  exports: [PatientVitalRiskHistoryModelService],
})
export class PatientVitalRiskHistoryModelModule {}
