import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { RiskLevel } from './medical_alerts.enum';
import { VitalSign } from 'src/models/vital_signs/entity/vital_sign.entity';

@Entity()
export class PatientVitalRisk {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_vital_risk_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientVitalRisks)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'vital_sign_id' })
  vitalSignId: string;
  @ManyToOne(
    () => VitalSign,
    (vitalSignsMaster) => vitalSignsMaster.patientRisk,
  )
  @JoinColumn({ name: 'vital_sign_id' })
  vitalSign: VitalSign;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

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
