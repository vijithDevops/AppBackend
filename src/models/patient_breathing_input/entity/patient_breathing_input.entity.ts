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
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';
import { BreatingExercisePrescription } from '../../breathing_exercise_prescription/entity/breathing_exercise_prescription.entity';

@Entity()
export class PatientBreathingInput {
  @PrimaryGeneratedColumn('uuid')
  @Index('patient_breathing_input_id_uidx', { unique: true })
  id: string;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

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
  @ManyToOne(() => User, (user) => user.patientBreathingInputs)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'breathing_prescription_id' })
  breathingPrescriptionId: string;
  @ManyToOne(
    () => BreatingExercisePrescription,
    (prescription) => prescription.patientBreathingInputs,
  )
  @JoinColumn({ name: 'breathing_prescription_id' })
  breatingExercisePrescription: BreatingExercisePrescription;

  @Column({ name: 'calendar_id' })
  calendarId: string;
  @ManyToOne(() => Calendar, (calendar) => calendar.patientBreathingInputs)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;
}
