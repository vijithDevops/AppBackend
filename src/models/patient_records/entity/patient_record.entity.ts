import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Unique,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { File } from '../../file/entity/file.entity';
import { PatientRecordType } from './patient_record.enum';

@Entity()
@Unique('UQ_patient_record', ['patientId', 'fileId'])
export class PatientRecord {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_record_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'type', type: 'enum', enum: PatientRecordType })
  type: PatientRecordType;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  @Column({ name: 'patient_id' })
  patientId: string;
  @ManyToOne(() => User, (user) => user.patientRecords)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'file_id', nullable: true })
  fileId?: string;
  @OneToOne(() => File, (file) => file.patientRecord)
  @JoinColumn({ name: 'file_id' })
  file: File;
}
