import { PatientVitalRisk } from 'src/models/medical_alerts/entity/patient_vital_risk.entity';
import { PatientVitalRiskHistory } from 'src/models/patient_vital_risk_history/entity/patient_vital_risk_history.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { VitalSignsMaster } from './vital_signs_master.entity';

@Entity('vital_signs')
export class VitalSign {
  @PrimaryGeneratedColumn('uuid')
  @Index('vital_sign_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  @Index('vital_sign_name_uidx', { unique: true })
  name: string;

  @Column({
    name: 'external_key',
    type: 'varchar',
    length: 150,
  })
  externalKey: string;

  @Column({
    name: 'is_medical_engine_alert',
    type: Boolean,
    default: false,
  })
  isMedicalEngineAlert: boolean;

  @OneToMany(
    () => VitalSignsMaster,
    (vitalSignsMaster) => vitalSignsMaster.vitalSign,
  )
  vitalSignMaster: VitalSignsMaster[];

  @OneToMany(
    () => PatientVitalRisk,
    (patientVitalRisk) => patientVitalRisk.vitalSign,
  )
  patientRisk: PatientVitalRisk[];

  @OneToMany(
    () => PatientVitalRiskHistory,
    (patientVitalRiskHistory) => patientVitalRiskHistory.vitalSign,
  )
  patientVitalRiskHistory: PatientVitalRiskHistory[];
}
