import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
// import { PatientRiskHistoryChartDto } from 'src/api/routes/medical-alerts/dto/patient_risk_history_chart.dto';
import { Repository } from 'typeorm';
import { PatientMedicalRiskHistory } from './entity/patient_medical_risk_history.entity';
import {
  ICreatePatientMedicalRiskHistory,
  IPatientMedicalRiskHistory,
} from './interfaces';

@Injectable()
export class PatientMedicalRiskHistoryModelService {
  constructor(
    @InjectRepository(PatientMedicalRiskHistory)
    private patientMedicalRiskHistoryRepository: Repository<PatientMedicalRiskHistory>,
  ) {}
  async createMany(
    createPatientMedicalRiskHistory: ICreatePatientMedicalRiskHistory[],
  ): Promise<PatientMedicalRiskHistory[]> {
    return await this.patientMedicalRiskHistoryRepository
      .save(createPatientMedicalRiskHistory)
      .catch((err) => {
        throw err;
      });
  }

  async getMedicalAndVitalRiskHistory(
    patientRiskHistoryChart: IPatientMedicalRiskHistory,
  ) {
    const {
      patientId,
      resolutionType,
      startDate,
      endDate,
    } = patientRiskHistoryChart;
    const query = this.patientMedicalRiskHistoryRepository
      .createQueryBuilder('patient_medical_risk_history')
      .leftJoinAndSelect(
        'patient_medical_risk_history.patientVitalRiskHistory',
        'patientVitalRiskHistory',
      )
      .leftJoinAndSelect('patientVitalRiskHistory.vitalSign', 'vitalSign')
      .where('patient_medical_risk_history.patientId =:patientId', {
        patientId,
      })
      // .andWhere(`TO_CHAR(patient_medical_risk_history.start_date::DATE, 'YYYY-MM-DD') >= '${moment(new Date(startDate)).format('YYYY-MM-DD')}'`)
      // .andWhere(`TO_CHAR(patient_medical_risk_history.end_date::DATE, 'YYYY-MM-DD') <= '${moment(new Date(endDate)).format('YYYY-MM-DD')}'`)
      .andWhere(
        `TO_CHAR(patient_medical_risk_history.start_date::DATE, 'YYYY-MM-DD') BETWEEN '${moment(
          new Date(startDate),
        ).format('YYYY-MM-DD')}' AND '${moment(new Date(endDate)).format(
          'YYYY-MM-DD',
        )}'`,
      );
    if (resolutionType) {
      query.andWhere(
        'patient_medical_risk_history.resolutionType =:resolutionType',
        { resolutionType },
      );
    }
    return await query.getMany();
  }
}
