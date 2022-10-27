import { ResolutionType } from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class IFindPatientMedicalRiskHistoryFilter {
  skip: number;
  limit: number;
  sort?: 'ASC' | 'DESC' = 'DESC';
}

export class IPatientMedicalRiskHistory {
  patientId: string;
  startDate: Date;
  endDate: Date;
  resolutionType?: ResolutionType;
}
