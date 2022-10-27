import { RiskLevel } from 'src/models/medical_alerts/entity/medical_alerts.enum';
import { IPatientVitalRisks } from './patient_vital_risks';

export class IPatientRiskLevels {
  amber: number;
  red: number;
  green: number;
  latestReading: boolean;
  vitalRisk: IPatientVitalRisks[];
}
