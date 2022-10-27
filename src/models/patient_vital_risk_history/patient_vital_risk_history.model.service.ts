import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientVitalRiskHistory } from './entity/patient_vital_risk_history.entity';
import { ICreatePatientVitalRiskHistory } from './interfaces';

@Injectable()
export class PatientVitalRiskHistoryModelService {
  constructor(
    @InjectRepository(PatientVitalRiskHistory)
    private patientVitalRiskHistoryRepository: Repository<PatientVitalRiskHistory>,
  ) {}
  async createMany(
    createPatientVitalRiskHistoryRepository: ICreatePatientVitalRiskHistory[],
  ): Promise<PatientVitalRiskHistory[]> {
    return await this.patientVitalRiskHistoryRepository
      .save(createPatientVitalRiskHistoryRepository)
      .catch((err) => {
        throw err;
      });
  }
}
