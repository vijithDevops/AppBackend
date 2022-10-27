import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { RiskLevel } from './medical_alerts.enum';

@Entity()
export class PatientMedicalRisk {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_medical_risk_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @OneToOne(() => User, (user) => user.patientMedicalRisk)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ name: 'consecutive_amber_risk_count', type: 'integer', default: 0 })
  consecutiveAmberRiskCount: number;

  @Column({ name: 'acknowledge_required', type: 'boolean', default: 0 })
  acknowledgeRequired: boolean;

  @Column({
    name: 'last_acknowledged_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastAcknowledgedAt?: Date;

  @Column({ name: 'last_acknowledged_by', nullable: true })
  lastAcknowledgedBy?: string;
  @ManyToOne(() => User, (user) => user.medicalRiskAcknowledgements)
  @JoinColumn({ name: 'last_acknowledged_by' })
  lastAcknowledgedUser?: User;

  @Column({
    name: 'last_notified_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastNotifiedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;
}
