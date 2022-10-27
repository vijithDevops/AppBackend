import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/models/user/entity/user.entity';
import { VitalSignsMaster } from './vital_signs_master.entity';

@Entity('patient_vital_signs')
@Unique(['vitalSignId', 'patientId'])
export class PatientVitalSigns {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_vital_signs_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'vital_sign_id' })
  vitalSignId: string;
  @ManyToOne(
    () => VitalSignsMaster,
    (vitalSignsMaster) => vitalSignsMaster.patientVitalSigns,
  )
  @JoinColumn({ name: 'vital_sign_id' })
  vitalSign: VitalSignsMaster;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user: User) => user.patientVitalSigns)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;
}
