import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';

@Entity()
@Unique('calendar_pateint_health_input_uidx', ['patientId', 'calendarId'])
export class PatientHealthInputs {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_health_input_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'blood_pressure_systolic', type: 'numeric', nullable: true })
  bloodPressureSystolic?: number;

  @Column({ name: 'blood_pressure_diastolic', type: 'numeric', nullable: true })
  bloodPressureDiastolic?: number;

  @Column({ name: 'weight', type: 'numeric', nullable: true })
  weight?: number;

  @Column({ name: 'blood_sugar', type: 'numeric', nullable: true })
  bloodSugar?: number;

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
  @ManyToOne(() => User, (user) => user.patientHealthInputs)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientHealthInputs)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
