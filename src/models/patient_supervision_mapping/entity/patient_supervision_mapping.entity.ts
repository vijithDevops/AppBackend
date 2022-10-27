import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';

@Entity()
@Index(['patientId', 'userId'], {
  unique: true,
})
@Unique(['patientId', 'userId'])
export class PatientSupervisionMapping {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_supervision_mapping_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientSupervisors)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.assignedPatients)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_incharge', type: 'boolean', default: false })
  isIncharge: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  createdBy?: number;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt?: Date;

  @Column({
    name: 'updated_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
    select: false,
  })
  deletedAt?: Date;

  @Column({
    name: 'deleted_by',
    nullable: true,
    type: 'varchar',
    length: 254,
    select: false,
  })
  deletedBy?: string;
}
