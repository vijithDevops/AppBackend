import {
  ResolutionType,
  RiskLevel,
} from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class ICreatePatientMedicalRiskHistory {
  patientId: string;
  riskLevel: RiskLevel;
  startDate: Date;
  endDate: Date;
  resolutionType: ResolutionType;
}
