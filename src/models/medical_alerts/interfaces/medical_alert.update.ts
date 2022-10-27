import {
  ResolutionType,
  RiskLevel,
  RiskReadingType,
  RiskStratification,
} from '../entity/medical_alerts.enum';

export class IUpdateMedicalAlertsSettings {
  isActive?: boolean;
  resolution?: ResolutionType;
  riskStratification?: RiskStratification;
  amberRiskApplicability?: boolean;
  amberRiskReadingType?: RiskReadingType;
  amberRiskReadingChoice?: number;
  amberRiskReadingOutOf?: number;
  notifyAmberRisk?: boolean;
  redRiskApplicability?: boolean;
  redRiskReadingType?: RiskReadingType;
  redRiskReadingChoice?: number;
  redRiskReadingOutOf?: number;
  notifyRedRisk?: boolean;
  greenRiskApplicability?: boolean;
  notifyGreenRisk?: boolean;
  consecutiveAmberRisk?: number;
  reactivationHours?: number;
  reactivationDays?: number;
  schedulerId?: string;
}

export class IUpdatePatientMedicalRisk {
  riskLevel: RiskLevel;
  consecutiveAmberRiskCount?: number;
  acknowledgeRequired?: boolean;
}

export class IUpdatePatientVitalRisk {
  vitalSignId: string;
  riskLevel: RiskLevel;
}
