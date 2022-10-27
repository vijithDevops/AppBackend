import { ResolutionType, RiskLevel } from 'src/models/medical_alerts/entity/medical_alerts.enum';
import { PatientVitalRiskHistory } from 'src/models/patient_vital_risk_history/entity/patient_vital_risk_history.entity';
import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity()
export class PatientMedicalRiskHistory {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_medical_risk_history_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientMedicalRiskHistory)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @OneToMany(
    () => PatientVitalRiskHistory,
    (patientVitalRiskHistory) => patientVitalRiskHistory.patientMedicalRiskHistory,
  )
  patientVitalRiskHistory: PatientVitalRiskHistory[];

  @Column({ name: 'resolution_type', type: 'enum',enum: ResolutionType, nullable: true })
  resolutionType: string;
}
