import { RiskLevel } from '../entity/medical_alerts.enum';

export class ICreatePatientMedicalRisk {
  patientId: string;
  riskLevel: RiskLevel;
  consecutiveAmberRiskCount?: number;
  acknowledgeRequired?: boolean;
}
