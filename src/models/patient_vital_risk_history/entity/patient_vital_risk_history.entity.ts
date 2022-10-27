import { RiskLevel } from 'src/models/medical_alerts/entity/medical_alerts.enum';
import { PatientMedicalRiskHistory } from 'src/models/patient_medical_risk_history/entity/patient_medical_risk_history.entity';
import { VitalSign } from 'src/models/vital_signs/entity/vital_sign.entity';
import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class PatientVitalRiskHistory {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_vital_risk_history_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'vital_sign_id' })
  vitalSignId: string;
  @ManyToOne(() => VitalSign, (vitalSign) => vitalSign.patientVitalRiskHistory)
  @JoinColumn({ name: 'vital_sign_id' })
  vitalSign: VitalSign;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ name: 'patient_medical_risk_history_id' })
  patientMedicalRiskHistoryId: string;
  @ManyToOne(() => PatientMedicalRiskHistory, (patientMedicalRiskHistory) => 
  patientMedicalRiskHistory.patientVitalRiskHistory)
  @JoinColumn({ name: 'patient_medical_risk_history_id' })
  patientMedicalRiskHistory: PatientMedicalRiskHistory;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  
}
