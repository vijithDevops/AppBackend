import { RiskLevel } from "src/models/medical_alerts/entity/medical_alerts.enum";

export class ICreatePatientVitalRiskHistory {
  vitalSignId: string;
  riskLevel: RiskLevel;
  patientMedicalRiskHistoryId: string;
}
