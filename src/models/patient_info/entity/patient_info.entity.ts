import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Gateway } from '../../gateway/entity/gateway.entity';
import { Sensor } from '../../sensor/entity/sensor.entity';

@Entity()
export class PatientInfo {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_info_id_uidx', { unique: true })
  id: string;

  @PrimaryGeneratedColumn()
  @Column({
    name: 'patient_id',
    type: 'int',
  })
  @Index('patient_info_id_int_uidx', { unique: true })
  patientId: number;

  @PrimaryGeneratedColumn()
  @Column({
    name: 'patient_id_string',
    type: 'varchar',
  })
  @Index('patient_info_id_string_uidx', { unique: true })
  patientIdString: string;

  @Column({ name: 'user_id' })
  userId: string;
  @OneToOne(() => User, (user) => user.patientInfo)
  @JoinColumn({ name: 'user_id' })
  patient: User;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob: Date;

  @Column({ name: 'diagnosis', type: 'varchar', length: 150, nullable: true })
  diagnosis?: string;

  @Column({
    name: 'medication_prescription',
    type: 'text',
    nullable: true,
  })
  medicationPrescription?: string;

  @Column({ name: 'height', type: 'real', nullable: true })
  height?: number;

  @Column({ name: 'weight', type: 'real', nullable: true })
  weight?: number;

  @Column({ name: 'respiration_rate', type: 'real', nullable: true })
  respirationRate?: number;

  @Column({ name: 'heart_rate', type: 'real', nullable: true })
  heartRate?: number;

  @Column({ name: 'spo2', type: 'real', nullable: true })
  spo2?: number;

  @Column({
    name: 'admission_date',
    type: 'date',
    nullable: true,
  })
  admissionDate?: Date;

  @Column({
    name: 'iris_on_board_date',
    type: 'date',
    nullable: true,
  })
  irisOnboardDate?: Date;

  @Column({
    name: 'discharge_date',
    type: 'date',
    nullable: true,
  })
  dischargeDate?: Date;

  @Column({
    name: 'expected_end_date',
    type: 'date',
    nullable: true,
  })
  expectedEndDate?: Date;

  @Column({ name: 'nok_name', type: 'varchar', length: 100, nullable: true })
  nokName: string;

  @Column({
    name: 'nok_contact_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  nokContactNumber: string;

  @Column({ name: 'nok_contact_email', type: 'varchar', nullable: true })
  nokContactEmail?: string;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt?: Date;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar', length: 254 })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true, type: 'varchar', length: 254 })
  deletedBy?: string;

  @OneToMany(() => Gateway, (gateway) => gateway.patient)
  gateways: Gateway[];

  @OneToMany(() => Sensor, (sensor) => sensor.patient)
  sensors: Sensor[];
}
