import { RiskLevel } from 'src/models/medical_alerts/entity/medical_alerts.enum';

export class IPatientVitalRisks {
  vitalSignId: string;
  riskLevel: RiskLevel;
}
