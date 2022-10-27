import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationVitalSigns } from './organization_vital_signs.entity';
import { PatientVitalSigns } from './patient_vital_signs.entity';
import { MeasuringScale } from './vital_sign.enum';
import { VitalSign } from './vital_sign.entity';

@Entity('vital_signs_master')
export class VitalSignsMaster {
  @PrimaryGeneratedColumn('uuid')
  @Index('vital_signs_id_uidx', { unique: true })
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  @Index('vital_signs_name_uidx', { unique: true })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  @Index('vital_signs_key_uidx', { unique: true })
  key: string;

  @Column({
    name: 'measuring_scale',
    type: 'enum',
    enum: MeasuringScale,
    default: MeasuringScale.HIGHER,
  })
  measuringScale: MeasuringScale;

  @Column({ name: 'vital_sign_id' })
  vitalSignId: string;
  @ManyToOne(() => VitalSign, (vitalSign) => vitalSign.vitalSignMaster)
  @JoinColumn({ name: 'vital_sign_id' })
  vitalSign: VitalSign;

  @Column({
    name: 'is_applicable',
    type: Boolean,
    default: true,
  })
  isApplicable: boolean;

  @Column({ name: 'amber_value', type: 'real' })
  amberValue: number;

  @Column({ name: 'red_value', type: 'real' })
  redValue: number;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order?: number;

  @OneToMany(
    () => OrganizationVitalSigns,
    (organizationVitalSigns) => organizationVitalSigns.vitalSign,
  )
  organizationVitalSigns: OrganizationVitalSigns[];

  @OneToMany(
    () => PatientVitalSigns,
    (patientVitalSigns) => patientVitalSigns.vitalSign,
  )
  patientVitalSigns: PatientVitalSigns[];
}
